import {
  BufferAttribute, BufferGeometry, Group, LineBasicMaterial, LineDashedMaterial,
  LineSegments, Matrix4, Points, PointsMaterial, Quaternion, Vector3
} from 'three';
import type { AssemblyFrame, RobotModel, Transform, ViewOptions } from '../types/model';

export function transformMatrix(transform: Transform, out = new Matrix4()): Matrix4 {
  return out.compose(new Vector3().fromArray(transform.position), new Quaternion().fromArray(transform.quaternion), new Vector3().fromArray(transform.scale));
}

/** Only authored mount frames, connected relationships and joint axes are drawn. */
export class MechanicalOverlays {
  readonly root = new Group();
  private readonly partIndices: Map<string, number>;
  private readonly solid: LineSegments<BufferGeometry, LineBasicMaterial>;
  private readonly inferred: LineSegments<BufferGeometry, LineDashedMaterial>;
  private readonly axes: LineSegments<BufferGeometry, LineBasicMaterial>;
  private readonly mounts: Points<BufferGeometry, PointsMaterial>;
  private readonly explosion: LineSegments<BufferGeometry, LineBasicMaterial>;
  private readonly positions: Float32Array[];
  private readonly geometries: BufferGeometry[];
  private readonly pointA = new Vector3();
  private readonly pointB = new Vector3();
  private readonly matrix = new Matrix4();
  private readonly subassemblyBindings = new Map<string, { index: number; subassemblyIndex: number }>();
  private readonly quaternion = new Quaternion();
  private readonly scale = new Vector3();
  private readonly counts = new Uint32Array(5);
  private readonly jointOrigins: Matrix4[];
  private readonly connectionAnchors: { aIndex: number; bIndex: number; a: Vector3; b: Vector3; inferred: boolean }[];
  private readonly distances: Float32Array;

  constructor(private readonly model: RobotModel) {
    this.partIndices = new Map(model.parts.map((part, index) => [part.id, index]));
    this.connectionAnchors = model.connections.map((connection) => {
      const aIndex = this.partIndices.get(connection.a.partInstanceId);
      const bIndex = this.partIndices.get(connection.b.partInstanceId);
      const a = aIndex === undefined ? undefined : model.parts[aIndex].connectionPoints.find((point) => point.id === connection.a.connectionPointId);
      const b = bIndex === undefined ? undefined : model.parts[bIndex].connectionPoints.find((point) => point.id === connection.b.connectionPointId);
      if (aIndex === undefined || bIndex === undefined || !a || !b) throw new Error(`Missing connection mount: ${connection.id}`);
      const category = connection.evidence.relationship.category;
      return { aIndex, bIndex, a: new Vector3().fromArray(a.localTransform.position), b: new Vector3().fromArray(b.localTransform.position), inferred: category !== 'documented' && category !== 'cad-derived' };
    });
    const connectionCapacity = model.connections.length * 6;
    const mountCapacity = model.parts.reduce((sum, part) => sum + part.connectionPoints.length * 3, 0);
    this.positions = [new Float32Array(connectionCapacity), new Float32Array(connectionCapacity), new Float32Array(model.joints.length * 6), new Float32Array(mountCapacity), new Float32Array(model.parts.length * 6)];
    this.jointOrigins = model.joints.map((joint) => transformMatrix(joint.origin));
    this.distances = new Float32Array(model.connections.length * 2);
    this.geometries = this.positions.map((positions) => new BufferGeometry().setAttribute('position', new BufferAttribute(positions, 3)));
    this.geometries[1].setAttribute('lineDistance', new BufferAttribute(this.distances, 1));
    this.solid = new LineSegments(this.geometries[0], new LineBasicMaterial({ color: '#65dfcf', depthTest: false, transparent: true, opacity: 0.85 }));
    this.inferred = new LineSegments(this.geometries[1], new LineDashedMaterial({ color: '#ffd187', dashSize: 2, gapSize: 1.5, depthTest: false }));
    this.axes = new LineSegments(this.geometries[2], new LineBasicMaterial({ color: '#ff936f', depthTest: false }));
    this.mounts = new Points(this.geometries[3], new PointsMaterial({ color: '#65dfcf', size: 5, sizeAttenuation: false, depthTest: false }));
    this.explosion = new LineSegments(this.geometries[4], new LineBasicMaterial({ color: '#b2c3d6', transparent: true, opacity: 0.65, depthTest: true }));
    this.root.add(this.solid, this.inferred, this.axes, this.mounts, this.explosion);
    this.root.renderOrder = 4;
    for (const object of this.root.children) { object.frustumCulled = false; object.renderOrder = 4; }
    const descendant = (id: string): number | undefined => {
      const sub = model.subassemblies.find((entry) => entry.id === id);
      if (!sub) return undefined;
      for (const partId of sub.partInstanceIds) {
        const index = this.partIndices.get(partId);
        if (index !== undefined) return index;
      }
      for (const child of sub.childSubassemblyIds) { const index = descendant(child); if (index !== undefined) return index; }
      return undefined;
    };
    for (const [subassemblyIndex, sub] of model.subassemblies.entries()) {
      const index = descendant(sub.id);
      if (index === undefined) continue;
      this.subassemblyBindings.set(sub.id, { index, subassemblyIndex });
    }
  }

  update(matrices: readonly Matrix4[], frame: AssemblyFrame, view: ViewOptions, included: Uint8Array): void {
    const counts = this.counts;
    counts.fill(0);
    if (view.showConnections) {
      for (let index = 0; index < this.model.connections.length; index++) {
        const anchors = this.connectionAnchors[index];
        if (!frame.connected[index] || !included[anchors.aIndex] || !included[anchors.bIndex]) continue;
        this.pointA.copy(anchors.a).applyMatrix4(matrices[anchors.aIndex]);
        this.pointB.copy(anchors.b).applyMatrix4(matrices[anchors.bIndex]);
        const slot = anchors.inferred ? 1 : 0;
        this.pointA.toArray(this.positions[slot], counts[slot]); counts[slot] += 3;
        this.pointB.toArray(this.positions[slot], counts[slot]); counts[slot] += 3;
        if (slot === 1) {
          const vertex = counts[1] / 3 - 2;
          this.distances[vertex] = 0;
          this.distances[vertex + 1] = this.pointA.distanceTo(this.pointB);
        }
      }
      for (let index = 0; index < this.model.parts.length; index++) {
        if (!included[index]) continue;
        for (const mount of this.model.parts[index].connectionPoints) {
          this.pointA.fromArray(mount.localTransform.position).applyMatrix4(matrices[index]).toArray(this.positions[3], counts[3]);
          counts[3] += 3;
        }
      }
    }
    if (view.showJoints) {
      for (let jointIndex = 0; jointIndex < this.model.joints.length; jointIndex++) {
        const joint = this.model.joints[jointIndex];
        if (joint.parent.kind === 'part') {
          const index = this.partIndices.get(joint.parent.id);
          if (index === undefined || !included[index]) continue;
          this.matrix.copy(matrices[index]);
        } else {
          const binding = this.subassemblyBindings.get(joint.parent.id);
          if (!binding || !included[binding.index]) continue;
          const offset = binding.subassemblyIndex * 10;
          this.matrix.compose(this.pointA.fromArray(frame.subassemblyTransforms, offset), this.quaternion.fromArray(frame.subassemblyTransforms, offset + 3), this.scale.fromArray(frame.subassemblyTransforms, offset + 7));
          // Keep joint axes with the inspection explosion, not a guessed rest-pose parent.
          this.pointA.setFromMatrixPosition(matrices[binding.index]).sub(this.pointB.fromArray(frame.transforms, binding.index * 10));
          this.matrix.setPosition(this.pointB.setFromMatrixPosition(this.matrix).add(this.pointA));
        }
        this.matrix.multiply(this.jointOrigins[jointIndex]);
        this.pointA.set(0, 0, 0).applyMatrix4(this.matrix);
        this.pointB.fromArray(joint.axis).normalize().multiplyScalar(16).applyMatrix4(this.matrix);
        this.pointA.toArray(this.positions[2], counts[2]); counts[2] += 3;
        this.pointB.toArray(this.positions[2], counts[2]); counts[2] += 3;
      }
    }
    if (view.explodedFactor > 0) {
      for (let index = 0; index < this.model.parts.length; index++) {
        if (!included[index]) continue;
        this.pointA.fromArray(frame.transforms, index * 10);
        this.pointB.setFromMatrixPosition(matrices[index]);
        if (this.pointA.distanceToSquared(this.pointB) < 0.01) continue;
        this.pointA.toArray(this.positions[4], counts[4]); counts[4] += 3;
        this.pointB.toArray(this.positions[4], counts[4]); counts[4] += 3;
      }
    }
    this.geometries.forEach((geometry, index) => {
      geometry.setDrawRange(0, counts[index] / 3);
      geometry.attributes.position.needsUpdate = true;
    });
    this.geometries[1].attributes.lineDistance.needsUpdate = true;
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    this.solid.material.dispose(); this.inferred.material.dispose(); this.axes.material.dispose(); this.mounts.material.dispose();
    this.explosion.material.dispose();
    this.root.clear();
  }
}

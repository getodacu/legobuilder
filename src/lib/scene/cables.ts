import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Group, Matrix4, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import type { AssemblyFrame, RobotModel, ViewOptions } from '../types/model.ts';

/** Qualitative PF2 ribbon routing, never a length constraint or flexible-body solver. */
export class FlexibleCables {
  readonly root = new Group();
  private readonly material = new MeshStandardMaterial({ color: '#b8b9b5', roughness: 0.85 });
  private readonly matrix = new Matrix4();
  private readonly position = new Vector3();
  private readonly quaternion = new Quaternion();
  private readonly scale = new Vector3();
  private readonly center = new Vector3();
  private readonly tangent = new Vector3();
  private readonly width = new Vector3();
  private readonly normal = new Vector3();
  private readonly vertex = new Vector3();
  private readonly routes;

  constructor(model: RobotModel) {
    this.routes = model.cables.filter((route) => route.controlPoints.length >= 2).map((route) => {
      const points = route.controlPoints.map(() => new Vector3());
      const segments = (points.length - 1) * 12;
      const positions = new BufferAttribute(new Float32Array((segments + 1) * 4 * 3), 3);
      const geometry = new BufferGeometry().setAttribute('position', positions);
      const indices: number[] = [];
      for (let ring = 0; ring < segments; ring++) for (let side = 0; side < 4; side++) {
        const a = ring * 4 + side, b = ring * 4 + (side + 1) % 4;
        indices.push(a, a + 4, b, b, a + 4, b + 4);
      }
      geometry.setIndex(indices);
      const mesh = new Mesh(geometry, this.material);
      mesh.name = `cable:${route.id}`; mesh.frustumCulled = false; mesh.visible = false;
      this.root.add(mesh);
      return {
        route, points, segments, positions, mesh, curve: new CatmullRomCurve3(points, false, 'centripetal'),
        connections: [route.fromConnection, route.toConnection].map((id) => model.connections.findIndex((entry) => entry.id === id)),
        controls: route.controlPoints.map((control) => ({
          local: new Vector3().fromArray(control.position),
          part: control.parent?.kind === 'part' ? model.parts.findIndex((entry) => entry.id === control.parent!.id) : -1,
          sub: control.parent?.kind === 'subassembly' ? model.subassemblies.findIndex((entry) => entry.id === control.parent!.id) : -1
        })),
        endpointParts: [route.fromConnection, route.toConnection].flatMap((id) => {
          const connection = model.connections.find((entry) => entry.id === id)!;
          return [connection.a, connection.b].map((endpoint) => model.parts.findIndex((entry) => entry.id === endpoint.partInstanceId));
        })
      };
    });
  }

  update(matrices: readonly Matrix4[], frame: AssemblyFrame, view: ViewOptions, included: Uint8Array): void {
    for (const cable of this.routes) {
      // Explode/isolation intentionally omit flexible spans rather than imply stretched physical leads.
      cable.mesh.visible = view.explodedFactor === 0 && view.isolatedPartIds.length === 0 && cable.connections.every((index) => Boolean(frame.connected[index])) && cable.endpointParts.every((index) => Boolean(included[index]));
      if (!cable.mesh.visible) continue;
      for (let index = 0; index < cable.controls.length; index++) {
        const control = cable.controls[index], point = cable.points[index].copy(control.local);
        if (control.part >= 0) {
          if (!frame.installed[control.part]) cable.mesh.visible = false;
          point.applyMatrix4(matrices[control.part]);
        } else if (control.sub >= 0) {
          const offset = control.sub * 10;
          this.matrix.compose(this.position.fromArray(frame.subassemblyTransforms, offset), this.quaternion.fromArray(frame.subassemblyTransforms, offset + 3), this.scale.fromArray(frame.subassemblyTransforms, offset + 7));
          point.applyMatrix4(this.matrix);
        }
      }
      if (!cable.mesh.visible) continue;
      // Native s/23816s01.dat: six lobes, centers Z±7.347 LDU,
      // radial envelope sqrt(2)*1.46941 LDU. Render the rectangular outer envelope,
      // not invented cable diameter, corrugation, measured length or tension.
      const halfThickness = Math.SQRT2 * 1.46941 * 0.4;
      const halfWidth = (7.347 + Math.SQRT2 * 1.46941) * 0.4;
      this.width.set(0, 1, 0);
      for (let ring = 0; ring <= cable.segments; ring++) {
        const t = ring / cable.segments;
        cable.curve.getPoint(t, this.center); cable.curve.getTangent(t, this.tangent).normalize();
        this.normal.set(0, 1, 0).cross(this.tangent);
        if (this.normal.lengthSq() > 1e-10) this.width.copy(this.normal);
        else this.width.addScaledVector(this.tangent, -this.width.dot(this.tangent));
        if (this.width.lengthSq() < 1e-10) this.width.set(1, 0, 0);
        this.width.normalize(); this.normal.crossVectors(this.tangent, this.width).normalize();
        for (let side = 0; side < 4; side++) {
          this.vertex.copy(this.center).addScaledVector(this.width, (side < 2 ? 1 : -1) * halfWidth).addScaledVector(this.normal, (side === 0 || side === 3 ? 1 : -1) * halfThickness);
          cable.positions.setXYZ(ring * 4 + side, this.vertex.x, this.vertex.y, this.vertex.z);
        }
      }
      cable.positions.needsUpdate = true;
      cable.mesh.geometry.computeVertexNormals();
    }
  }

  dispose(): void {
    for (const cable of this.routes) cable.mesh.geometry.dispose();
    this.material.dispose(); this.root.clear();
  }
}

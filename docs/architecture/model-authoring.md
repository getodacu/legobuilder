# Model authoring

`src/lib/models/authoring.ts` contains build-time data helpers, not a runtime animation engine. The shared assembly compiler and sampler execute the resulting operations.

## Fragments

`BuildFragment` selects these `RobotModel` fields: `parts`, `steps`, `operations`, `installations`, `visibility`, `subassemblies`, `connections`, `joints`, `linkageConstraints`, `motors`, `cables`, `inventory`, `milestones`, and `sourceMappings`. It additionally requires:

- `rootId: string`: module root subassembly.
- `familyByPartId: Record<string, string>`: source inventory family for each instance.
- `attachmentSites: Record<string, { partInstanceId: string; connectionPointId: string; description: string; sourceReference: SourceReference }>`: named, source-backed interfaces.

Fragments own their objects. Integration must copy rather than mutate producer data. IDs must remain unique across the combined model. Module poses use millimeters, right-handed Y-up coordinates and identity initial roots; attachment frames are part-local, not copied world contacts.

## Placement and mating

`placeAtConnection(parentWorld, parentLocalFrame, childLocalFrame): Transform` solves `parentWorld * parentLocalFrame = childWorld * childLocalFrame` using shared transform composition and relative-transform helpers. Connection frames describe actual native mounting geometry; the helper neither discovers geometry nor establishes fit evidence. As with the shared TRS helpers, do not compose shear-producing nonuniform scales and rotations; mechanical connection frames normally have unit scale.

`addMate(receiver, receiverPoint, moving, movingPoint, options): Connection` appends the supplied `ConnectionPoint` objects to the corresponding parts and returns a connection. `options` requires `id`, connection `type`, and `evidence`, with optional `installedByOperationId`. It rejects preexisting duplicate point IDs, a new ID already registered on that part, and equal IDs when adding both points to the same part. Validation happens before either point is appended. Supply a fresh named point for each registration. Frames and evidence are retained as supplied; no geometry is moved and no world-space contact is invented.

## Mount operations

`mountPart(part, options): AssemblyOperation` accepts:

```ts
{
  id?: string; // default: mount-${part.id}
  stepId: string;
  sourceReference: SourceReference;
  startMs: number; // relative to the source step
  durationMs: number;
  axis?: Vec3; // normalized world-space insertion direction
  depthMm?: number; // positive source-derived seating travel
  dependencies: string[];
  cameraPreset?: CameraPreset;
  approachTrajectory?: Trajectory;
}
```

Without an axis, omit depth too. One transfer stage carries the entire initial pose to the final pose, including orientation alignment, over the whole duration. With an axis, provide positive finite depth: there is deliberately no default axle or pin depth. The approach reaches an aligned contact pose at `final.position - axis * depthMm`, with final orientation and scale. The subsequent linear axial insertion reaches the final pose. Approach and insertion use 60% and 40% of the duration respectively, smoothstep easing, and distinct stages. A custom approach trajectory never changes the axial insertion path.

Duration must be finite and positive, start time finite and nonnegative, the endpoint time finite, and both phases representably positive. Invalid axial options are rejected at authoring time. Operation endpoint arrays use the actual initial/final part poses, while each stage carries its own matching endpoints.

The approach and operation presentation evidence explicitly labels staging trajectory and proportional timing app-authored. Only the insertion stage receives the part's existing source-fit placement evidence; the helper does not promote unchecked fit to verified fit. Installation milestones and step duration remain producer responsibilities. Shape-specific rotation, fastening, and composite module motions can be authored directly with the same shared operation schema.

## Source view operations

`viewOperation(id, stepId, sourceReference, cameraPreset, durationMs): AssemblyOperation` creates a source-linked camera-only `align` operation starting at zero within its step. Its participant, endpoint, stage, dependency and parent-change arrays are empty. The owning step must use `action: 'view'`, as required by the strict compiler. Source relationship evidence is documented; framing and timing are app-authored presentation-only evidence. Duration must be finite and positive. It creates no installation, visibility change or invented physical assembly effect.

## Existing exports

`nativeLDrawTransform(position, quaternion?)` converts native placement through `N*T*N^-1`, where `N = Rx(pi) * 0.4`; it does not apply another conversion to mesh geometry. `evidence(category, note, sources, confidence?)`, `placement(relationship, numerical, presentation?)`, and `stepId(book, step)` remain available. `placement` initializes fit as `unchecked`; actual validation evidence must be supplied separately.

These are authoring contracts, not claims that authored operations or source steps have passed geometry, source-comparison, compiler, or playback verification.

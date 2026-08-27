import { parkConfig as C } from './config';
import { OuterTrack, InnerLawn, MonumentRing, GazeboRing, InternalPaths } from './Park';
import RelaxationArea from './RelaxationArea';
import Gazebo from './Gazebo';
import CampfireArea from './CampfireArea';
import Pergola from './Pergola';
import PlayArea from './PlayArea';
import GymArea from './GymArea';
import Landscape from './Landscape';

export default function MainPark() {
  return (
    <group>
      <InnerLawn />
      <OuterTrack />

      {/* Path layout */}
      <MonumentRing />
      <GazeboRing />
      <InternalPaths />

      {/* Structures */}
      <RelaxationArea />
      <Gazebo />
      <CampfireArea cx={C.waterCX} cz={C.waterCZ} />
      <Pergola />
      <PlayArea />
      <GymArea />

      {/* Landscape — trees OUTSIDE track, shrubs/flowers inside */}
      <Landscape />
    </group>
  );
}

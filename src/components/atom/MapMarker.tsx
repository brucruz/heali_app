import { PinBounce, Pulse } from '@/styles/components/atom/MapMarker';

interface MarkerProps {
  lat: number;
  lng: number;
  name: string;
  type?: 'user' | 'vendor';
}

const Marker: React.FC<MarkerProps> = ({ type = 'vendor' }) => {
  return (
    <div data-testid="map-marker-atom">
      <PinBounce type={type} />
      {type === 'user' && <Pulse />}
    </div>
  );
};

export default Marker;

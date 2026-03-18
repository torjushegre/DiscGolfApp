import DiscList from './DiscList';

function WallOfFame() {
  return (
    <DiscList
      status="wall_of_fame"
      title="Wall of Fame"
      emptyMessage="No aces yet"
      emptyHint="Add discs to the Wall of Fame after an ace"
      showConfetti={true}
      headerClassName="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg p-8 text-center shadow-lg"
    />
  );
}

export default WallOfFame;

import DiscList from './DiscList';

function Bag() {
  return (
    <DiscList
      status="bag"
      title="Disc Bag"
      emptyMessage="Your bag is empty"
      emptyHint="Add discs from the Shelf"
    />
  );
}

export default Bag;

import DiscList from './DiscList';

function Shelf() {
  return (
    <DiscList
      status="shelf"
      title="Disc Shelf"
      emptyMessage="Shelf is empty"
      emptyHint="Add new discs from the Add Disc page"
    />
  );
}

export default Shelf;

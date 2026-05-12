module {
  public type UserId = Principal;
  public type ItemId = Nat;
  public type RoomId = Nat;

  // Grid position in 8x8 grid
  public type GridPos = {
    row : Nat; // 0-7
    col : Nat; // 0-7
  };

  // An item placed at a specific grid cell
  public type PlacedItem = {
    itemId : ItemId;
    pos : GridPos;
  };

  // An inventory item
  public type Item = {
    id : ItemId;
    name : Text;
    emoji : Text;
    color : ?Text;
  };

  // A room with inventory and grid layout
  public type Room = {
    id : RoomId;
    name : Text;
    items : [Item];
    grid : [PlacedItem]; // up to 64 placements
  };
}

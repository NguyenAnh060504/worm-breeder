import Types "../types/common";

module {
  public type UserId = Types.UserId;
  public type ItemId = Types.ItemId;
  public type RoomId = Types.RoomId;
  public type GridPos = Types.GridPos;
  public type PlacedItem = Types.PlacedItem;
  public type Item = Types.Item;
  public type Room = Types.Room;

  // Internal mutable room state
  public type RoomInternal = {
    id : RoomId;
    name : Text;
    var items : [Item];
    var grid : [PlacedItem];
  };
}

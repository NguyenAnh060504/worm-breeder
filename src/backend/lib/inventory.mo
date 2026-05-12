import Types "../types/common";
import InventoryTypes "../types/inventory";

module {
  public type RoomId = Types.RoomId;
  public type ItemId = Types.ItemId;
  public type Item = Types.Item;
  public type Room = Types.Room;
  public type GridPos = Types.GridPos;
  public type PlacedItem = Types.PlacedItem;
  public type RoomInternal = InventoryTypes.RoomInternal;

  // Convert internal mutable room to public Room
  public func toPublicRoom(r : RoomInternal) : Room {
    { id = r.id; name = r.name; items = r.items; grid = r.grid };
  };

  // Get next room id (max existing id + 1, or 1 if empty)
  public func nextRoomId(rooms : [RoomInternal]) : RoomId {
    rooms.foldLeft(0, func(acc : Nat, r : RoomInternal) : Nat {
      if (r.id > acc) r.id else acc
    }) + 1;
  };

  // Get next item id (max existing id + 1, or 1 if empty)
  public func nextItemId(items : [Item]) : ItemId {
    items.foldLeft(0, func(acc : Nat, item : Item) : Nat {
      if (item.id > acc) item.id else acc
    }) + 1;
  };

  // Default 4 rooms for new users
  public func defaultRooms() : [RoomInternal] {
    [
      { id = 1; name = "Phòng khách"; var items = []; var grid = [] },
      { id = 2; name = "Phòng ngủ";  var items = []; var grid = [] },
      { id = 3; name = "Bếp";         var items = []; var grid = [] },
      { id = 4; name = "Phòng tắm";  var items = []; var grid = [] },
    ];
  };

  // Check if a grid cell is already occupied
  public func isCellOccupied(grid : [PlacedItem], pos : GridPos) : Bool {
    switch (grid.find(func(p : PlacedItem) : Bool { p.pos.row == pos.row and p.pos.col == pos.col })) {
      case (?_) true;
      case null false;
    };
  };
}

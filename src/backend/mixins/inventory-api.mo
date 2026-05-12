import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/common";
import InventoryTypes "../types/inventory";
import Lib "../lib/inventory";
import Principal "mo:core/Principal";

mixin (
  userRooms : Map.Map<Principal, List.List<InventoryTypes.RoomInternal>>
) {

  // Get or initialize rooms list for the caller
  func getOrInitRooms(caller : Principal) : List.List<InventoryTypes.RoomInternal> {
    switch (userRooms.get(caller)) {
      case (?rooms) rooms;
      case null {
        let rooms = List.fromArray<InventoryTypes.RoomInternal>(Lib.defaultRooms());
        userRooms.add(caller, rooms);
        rooms;
      };
    };
  };

  // ── Room Management ──────────────────────────────────────────────

  /// Returns all rooms for the calling user (creates defaults on first call)
  public shared ({ caller }) func getRooms() : async [Types.Room] {
    let rooms = getOrInitRooms(caller);
    rooms.map<InventoryTypes.RoomInternal, Types.Room>(Lib.toPublicRoom).toArray();
  };

  /// Create a new custom room with the given name
  public shared ({ caller }) func createRoom(name : Text) : async Types.Room {
    let rooms = getOrInitRooms(caller);
    let newId = Lib.nextRoomId(rooms.toArray());
    let room : InventoryTypes.RoomInternal = { id = newId; name; var items = []; var grid = [] };
    rooms.add(room);
    Lib.toPublicRoom(room);
  };

  /// Delete a room by id (only if it has no items in inventory)
  public shared ({ caller }) func deleteRoom(roomId : Types.RoomId) : async Bool {
    let rooms = getOrInitRooms(caller);
    switch (rooms.find(func(r : InventoryTypes.RoomInternal) : Bool { r.id == roomId })) {
      case null false;
      case (?room) {
        if (room.items.size() > 0) return false;
        let filtered = rooms.filter(func(r : InventoryTypes.RoomInternal) : Bool { r.id != roomId });
        rooms.clear();
        rooms.append(filtered);
        true;
      };
    };
  };

  // ── Item Management ──────────────────────────────────────────────

  /// Add an item to a room's inventory
  public shared ({ caller }) func addItem(roomId : Types.RoomId, name : Text, emoji : Text, color : ?Text) : async ?Types.Item {
    let rooms = getOrInitRooms(caller);
    switch (rooms.find(func(r : InventoryTypes.RoomInternal) : Bool { r.id == roomId })) {
      case null null;
      case (?room) {
        let newId = Lib.nextItemId(room.items);
        let item : Types.Item = { id = newId; name; emoji; color };
        room.items := room.items.concat([item]);
        ?item;
      };
    };
  };

  /// Remove an item from a room's inventory (also removes from grid)
  public shared ({ caller }) func removeItem(roomId : Types.RoomId, itemId : Types.ItemId) : async Bool {
    let rooms = getOrInitRooms(caller);
    switch (rooms.find(func(r : InventoryTypes.RoomInternal) : Bool { r.id == roomId })) {
      case null false;
      case (?room) {
        let before = room.items.size();
        room.items := room.items.filter(func(i : Types.Item) : Bool { i.id != itemId });
        if (room.items.size() == before) return false;
        room.grid := room.grid.filter(func(p : Types.PlacedItem) : Bool { p.itemId != itemId });
        true;
      };
    };
  };

  // ── Grid Layout ──────────────────────────────────────────────────

  /// Place an item at a grid position
  public shared ({ caller }) func placeItem(roomId : Types.RoomId, itemId : Types.ItemId, pos : Types.GridPos) : async Bool {
    let rooms = getOrInitRooms(caller);
    switch (rooms.find(func(r : InventoryTypes.RoomInternal) : Bool { r.id == roomId })) {
      case null false;
      case (?room) {
        // item must exist in inventory
        switch (room.items.find(func(i : Types.Item) : Bool { i.id == itemId })) {
          case null false;
          case (?_) {
            if (Lib.isCellOccupied(room.grid, pos)) return false;
            room.grid := room.grid.concat([{ itemId; pos }]);
            true;
          };
        };
      };
    };
  };

  /// Move an item from one grid cell to another
  public shared ({ caller }) func moveItem(roomId : Types.RoomId, fromPos : Types.GridPos, toPos : Types.GridPos) : async Bool {
    let rooms = getOrInitRooms(caller);
    switch (rooms.find(func(r : InventoryTypes.RoomInternal) : Bool { r.id == roomId })) {
      case null false;
      case (?room) {
        switch (room.grid.find(func(p : Types.PlacedItem) : Bool { p.pos.row == fromPos.row and p.pos.col == fromPos.col })) {
          case null false;
          case (?placed) {
            if (Lib.isCellOccupied(room.grid.filter(func(p : Types.PlacedItem) : Bool { not (p.pos.row == fromPos.row and p.pos.col == fromPos.col) }), toPos)) return false;
            room.grid := room.grid
              .filter(func(p : Types.PlacedItem) : Bool { not (p.pos.row == fromPos.row and p.pos.col == fromPos.col) })
              .concat([{ itemId = placed.itemId; pos = toPos }]);
            true;
          };
        };
      };
    };
  };

  /// Remove an item from a grid cell (does not delete it from inventory)
  public shared ({ caller }) func removeFromGrid(roomId : Types.RoomId, pos : Types.GridPos) : async Bool {
    let rooms = getOrInitRooms(caller);
    switch (rooms.find(func(r : InventoryTypes.RoomInternal) : Bool { r.id == roomId })) {
      case null false;
      case (?room) {
        let before = room.grid.size();
        room.grid := room.grid.filter(func(p : Types.PlacedItem) : Bool { not (p.pos.row == pos.row and p.pos.col == pos.col) });
        room.grid.size() < before;
      };
    };
  };
}

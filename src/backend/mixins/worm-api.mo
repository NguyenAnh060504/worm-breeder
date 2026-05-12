import List "mo:core/List";
import WormTypes "../types/worm";
import WormLib "../lib/worm";

mixin (worms : List.List<WormTypes.Worm>, state : { var nextWormId : Nat }) {

  /// Returns all worms.
  public shared func getWorms() : async [WormTypes.Worm] {
    worms.toArray();
  };

  /// Add a new worm (max 20). Returns the assigned WormId or an error.
  public shared func addWorm(newWorm : WormTypes.NewWorm) : async { #ok : WormTypes.WormId; #err : Text } {
    if (worms.size() >= 20) {
      return #err("Tổ đã đầy! Tối đa 20 con sâu.");
    };
    let id = state.nextWormId;
    state.nextWormId += 1;
    worms.add(WormLib.fromNew(id, newWorm));
    #ok(id);
  };

  /// Delete a worm by id. Returns #ok or an error.
  public shared func deleteWorm(id : WormTypes.WormId) : async { #ok; #err : Text } {
    let idx = worms.findIndex(func(w : WormTypes.Worm) : Bool { w.id == id });
    switch (idx) {
      case null { #err("Không tìm thấy con sâu.") };
      case (?i) {
        // Remove by swapping with last then truncating
        let last = worms.size() - 1;
        if (i < last) {
          worms.put(i, worms.at(last));
        };
        ignore worms.removeLast();
        #ok;
      };
    };
  };
}

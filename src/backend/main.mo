import List "mo:core/List";
import WormTypes "types/worm";
import WormMixin "mixins/worm-api";



actor {
  let worms = List.empty<WormTypes.Worm>();
  let state = { var nextWormId : Nat = 1 };

  include WormMixin(worms, state);
}

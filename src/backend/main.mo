import List "mo:core/List";
import WormTypes "types/worm";
import WormMixin "mixins/worm-api";
import WormLib "lib/worm";



actor {
  let worms = List.empty<WormTypes.Worm>();
  do {
    worms.add(WormLib.starterWorm(1));
  };
  let state = { var nextWormId : Nat = 2 };

  include WormMixin(worms, state);
}

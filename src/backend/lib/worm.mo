import WormTypes "../types/worm";

module {
  public type WormId = WormTypes.WormId;
  public type Worm = WormTypes.Worm;
  public type NewWorm = WormTypes.NewWorm;
  public type Element = WormTypes.Element;
  public type MutationVariant = WormTypes.MutationVariant;
  public type BodyPart = WormTypes.BodyPart;

  /// Returns the next available WormId by finding max id + 1
  public func nextWormId(worms : [Worm]) : WormId {
    var maxId : Nat = 0;
    for (w in worms.values()) {
      if (w.id > maxId) { maxId := w.id };
    };
    maxId + 1;
  };

  /// Build a Worm from a NewWorm input and an assigned id
  public func fromNew(id : WormId, newWorm : NewWorm) : Worm {
    { id; element = newWorm.element; head = newWorm.head; body = newWorm.body; tail = newWorm.tail };
  };

  /// Default starter worm (Grass element, all Solid parts)
  public func starterWorm(id : WormId) : Worm {
    let grassSolid : BodyPart = { element = #Grass; mutation = #Solid };
    { id; element = #Grass; head = grassSolid; body = grassSolid; tail = grassSolid };
  };
}

module {
  public type WormId = Nat;

  // Element type for worm and body parts
  public type Element = {
    #Electric;
    #Earth;
    #Grass;
    #Water;
  };

  // Visual mutation variant for a body part (0-4)
  public type MutationVariant = {
    #Solid;     // 0
    #Striped;   // 1
    #Spotted;   // 2
    #Gradient;  // 3
    #Metallic;  // 4
  };

  // A single body part with its own element and visual mutation
  public type BodyPart = {
    element : Element;
    mutation : MutationVariant;
  };

  // A worm with three body parts (head, body, tail)
  public type Worm = {
    id : WormId;
    element : Element;   // worm's primary element
    head : BodyPart;
    body : BodyPart;
    tail : BodyPart;
  };

  // Input type for creating a new worm (no id yet)
  public type NewWorm = {
    element : Element;
    head : BodyPart;
    body : BodyPart;
    tail : BodyPart;
  };
}

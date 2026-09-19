import OQL "mo:caffeineai-oql";
import Types "types/alerts";

module {
  /// AlertReason variant → tag text.
  public func _toRow(self : Types.AlertReason) : OQL.Value {
    #text(
      switch self {
        case (#belowMin) { "belowMin" };
        case (#aboveMax) { "aboveMax" };
        case (#movementDetected) { "movementDetected" };
      }
    );
  };
};

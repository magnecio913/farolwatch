import OQL "mo:caffeineai-oql";
import Types "types/sensors";

module {
  /// SensorStatus variant → tag text.
  public func _toRow(self : Types.SensorStatus) : OQL.Value {
    #text(
      switch self {
        case (#normal) { "normal" };
        case (#outOfRange) { "outOfRange" };
      }
    );
  };
};

import OQL "mo:caffeineai-oql";
import Types "types/sensors";

module {
  /// SensorType variant → tag text.
  public func _toRow(self : Types.SensorType) : OQL.Value {
    #text(
      switch self {
        case (#movement) { "movement" };
        case (#humidity) { "humidity" };
        case (#temperature) { "temperature" };
        case (#battery) { "battery" };
      }
    );
  };
};

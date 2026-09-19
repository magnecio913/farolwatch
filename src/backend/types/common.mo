module {
  /// Identifier for a farol (street lamp) record.
  public type FarolId = Nat;
  /// Identifier for a sensor record.
  public type SensorId = Nat;
  /// Identifier for an alert record.
  public type AlertId = Nat;
  /// Identifier for a linked device record.
  public type DeviceId = Nat;
  /// Identifier for a position-history entry.
  public type PositionId = Nat;
  /// Timestamp in nanoseconds since the Unix epoch (Time.now()).
  public type Timestamp = Int;
};

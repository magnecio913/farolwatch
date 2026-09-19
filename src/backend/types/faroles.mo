import Common "common";

module {
  public type FarolId = Common.FarolId;
  public type PositionId = Common.PositionId;
  public type Timestamp = Common.Timestamp;

  /// A farol registered by scanning its QR code.
  public type Farol = {
    id : FarolId;
    name : Text;
    qrCode : Text;
    latitude : Float;
    longitude : Float;
    registeredAt : Timestamp;
  };

  /// One GPS position captured when a farol QR code was scanned.
  public type PositionEntry = {
    id : PositionId;
    farolId : FarolId;
    latitude : Float;
    longitude : Float;
    recordedAt : Timestamp;
  };

  /// Shared view of a farol returned across the API boundary.
  public type FarolView = {
    id : FarolId;
    name : Text;
    qrCode : Text;
    latitude : Float;
    longitude : Float;
    registeredAt : Timestamp;
  };

  /// Shared view of a position-history entry.
  public type PositionEntryView = {
    id : PositionId;
    farolId : FarolId;
    latitude : Float;
    longitude : Float;
    recordedAt : Timestamp;
  };
};

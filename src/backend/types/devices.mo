import Common "common";

module {
  public type DeviceId = Common.DeviceId;
  public type Timestamp = Common.Timestamp;

  /// A mobile phone linked to the app to receive in-app notifications.
  public type LinkedDevice = {
    id : DeviceId;
    name : Text;
    linkedAt : Timestamp;
  };

  /// Shared view of a linked device returned across the API boundary.
  public type LinkedDeviceView = {
    id : DeviceId;
    name : Text;
    linkedAt : Timestamp;
  };
};

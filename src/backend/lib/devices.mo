import Map "mo:core/Map";
import Types "../types/devices";

module {
  func toView(device : Types.LinkedDevice) : Types.LinkedDeviceView {
    {
      id = device.id;
      name = device.name;
      linkedAt = device.linkedAt;
    };
  };

  /// Link a mobile phone as a registered device.
  public func linkDevice(
    devices : Map.Map<Types.DeviceId, Types.LinkedDevice>,
    state : { var nextDeviceId : Nat },
    name : Text,
    now : Types.Timestamp,
  ) : Types.LinkedDeviceView {
    let id = state.nextDeviceId;
    state.nextDeviceId := id + 1;
    let device : Types.LinkedDevice = { id; name; linkedAt = now };
    devices.add(id, device);
    toView(device);
  };

  /// List every linked device.
  public func listDevices(devices : Map.Map<Types.DeviceId, Types.LinkedDevice>) : [Types.LinkedDeviceView] {
    devices.values().map(toView).toArray();
  };

  /// Unlink a device by id.
  public func unlinkDevice(
    devices : Map.Map<Types.DeviceId, Types.LinkedDevice>,
    id : Types.DeviceId,
  ) : Bool {
    switch (devices.get(id)) {
      case (?_) {
        devices.remove(id);
        true;
      };
      case null { false };
    };
  };
};

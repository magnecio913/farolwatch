import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/devices";
import DevicesLib "../lib/devices";

mixin (
  devices : Map.Map<Types.DeviceId, Types.LinkedDevice>,
  state : { var nextDeviceId : Nat },
) {
  func requireAuthDevices(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Debes iniciar sesión para realizar esta acción");
    };
  };

  /// Link a mobile phone as a registered device.
  public shared ({ caller }) func linkDevice(name : Text) : async Types.LinkedDeviceView {
    requireAuthDevices(caller);
    DevicesLib.linkDevice(devices, state, name, Time.now());
  };

  /// List every linked device.
  public query ({ caller }) func listDevices() : async [Types.LinkedDeviceView] {
    requireAuthDevices(caller);
    DevicesLib.listDevices(devices);
  };

  /// Unlink a device by id.
  public shared ({ caller }) func unlinkDevice(id : Types.DeviceId) : async Bool {
    requireAuthDevices(caller);
    DevicesLib.unlinkDevice(devices, id);
  };
};

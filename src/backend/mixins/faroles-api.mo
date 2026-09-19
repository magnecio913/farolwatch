import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/faroles";
import FarolesLib "../lib/faroles";

mixin (
  faroles : Map.Map<Types.FarolId, Types.Farol>,
  positions : List.List<Types.PositionEntry>,
  state : { var nextFarolId : Nat; var nextPositionId : Nat },
) {
  func requireAuthFaroles(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Debes iniciar sesión para realizar esta acción");
    };
  };

  /// Register a farol from a QR scan, capturing the device GPS position.
  public shared ({ caller }) func registerFarol(
    qrCode : Text,
    name : Text,
    latitude : Float,
    longitude : Float,
  ) : async Types.FarolView {
    requireAuthFaroles(caller);
    FarolesLib.registerFarol(faroles, positions, state, qrCode, name, latitude, longitude, Time.now());
  };

  /// List every registered farol.
  public query ({ caller }) func listFaroles() : async [Types.FarolView] {
    requireAuthFaroles(caller);
    FarolesLib.listFaroles(faroles);
  };

  /// Fetch a single farol by id.
  public query ({ caller }) func getFarol(id : Types.FarolId) : async ?Types.FarolView {
    requireAuthFaroles(caller);
    FarolesLib.getFarol(faroles, id);
  };

  /// Position history for a farol, newest first.
  public query ({ caller }) func listPositions(farolId : Types.FarolId) : async [Types.PositionEntryView] {
    requireAuthFaroles(caller);
    FarolesLib.listPositions(positions, farolId);
  };
};

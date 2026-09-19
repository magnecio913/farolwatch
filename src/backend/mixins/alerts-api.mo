import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/alerts";
import SensorTypes "../types/sensors";
import AlertsLib "../lib/alerts";

mixin (
  sensors : Map.Map<SensorTypes.SensorId, SensorTypes.Sensor>,
  alerts : List.List<Types.Alert>,
  state : { var nextAlertId : Nat },
) {
  func requireAuthAlerts(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Debes iniciar sesión para realizar esta acción");
    };
  };

  /// Record a sensor reading; alerts are derived automatically from the
  /// configured min/max range (or movement activity).
  public shared ({ caller }) func recordReading(
    sensorId : SensorTypes.SensorId,
    value : Float,
  ) : async [Types.AlertView] {
    requireAuthAlerts(caller);
    AlertsLib.recordReading(sensors, alerts, state, sensorId, value, Time.now());
  };

  /// List alerts, newest first.
  public query ({ caller }) func listAlerts() : async [Types.AlertView] {
    requireAuthAlerts(caller);
    AlertsLib.listAlerts(alerts);
  };

  /// Fetch a single alert by id.
  public query ({ caller }) func getAlert(id : Types.AlertId) : async ?Types.AlertView {
    requireAuthAlerts(caller);
    AlertsLib.getAlert(alerts, id);
  };

  /// Mark an alert as read.
  public shared ({ caller }) func markAlertRead(id : Types.AlertId) : async ?Types.AlertView {
    requireAuthAlerts(caller);
    AlertsLib.markAlertRead(alerts, id);
  };
};

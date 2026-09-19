import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/faroles";

module {
  func toView(farol : Types.Farol) : Types.FarolView {
    {
      id = farol.id;
      name = farol.name;
      qrCode = farol.qrCode;
      latitude = farol.latitude;
      longitude = farol.longitude;
      registeredAt = farol.registeredAt;
    };
  };

  func positionToView(entry : Types.PositionEntry) : Types.PositionEntryView {
    {
      id = entry.id;
      farolId = entry.farolId;
      latitude = entry.latitude;
      longitude = entry.longitude;
      recordedAt = entry.recordedAt;
    };
  };

  /// Register a farol from a QR scan, or append a position entry when it exists.
  public func registerFarol(
    faroles : Map.Map<Types.FarolId, Types.Farol>,
    positions : List.List<Types.PositionEntry>,
    state : { var nextFarolId : Nat; var nextPositionId : Nat },
    qrCode : Text,
    name : Text,
    latitude : Float,
    longitude : Float,
    now : Types.Timestamp,
  ) : Types.FarolView {
    let existing = faroles.values().find(func f = f.qrCode == qrCode);
    switch (existing) {
      case (?farol) {
        let positionId = state.nextPositionId;
        state.nextPositionId := positionId + 1;
        positions.add({
          id = positionId;
          farolId = farol.id;
          latitude;
          longitude;
          recordedAt = now;
        });
        let updated : Types.Farol = {
          id = farol.id;
          name = if (name == "") { farol.name } else { name };
          qrCode = farol.qrCode;
          latitude;
          longitude;
          registeredAt = farol.registeredAt;
        };
        faroles.add(farol.id, updated);
        toView(updated);
      };
      case null {
        let farolId = state.nextFarolId;
        state.nextFarolId := farolId + 1;
        let farol : Types.Farol = {
          id = farolId;
          name;
          qrCode;
          latitude;
          longitude;
          registeredAt = now;
        };
        faroles.add(farolId, farol);
        let positionId = state.nextPositionId;
        state.nextPositionId := positionId + 1;
        positions.add({
          id = positionId;
          farolId;
          latitude;
          longitude;
          recordedAt = now;
        });
        toView(farol);
      };
    };
  };

  /// List every registered farol.
  public func listFaroles(faroles : Map.Map<Types.FarolId, Types.Farol>) : [Types.FarolView] {
    faroles.values().map(toView).toArray();
  };

  /// Fetch a single farol by id.
  public func getFarol(faroles : Map.Map<Types.FarolId, Types.Farol>, id : Types.FarolId) : ?Types.FarolView {
    switch (faroles.get(id)) {
      case (?farol) { ?toView(farol) };
      case null { null };
    };
  };

  /// Position history for a farol, newest first.
  public func listPositions(
    positions : List.List<Types.PositionEntry>,
    farolId : Types.FarolId,
  ) : [Types.PositionEntryView] {
    let matching = positions.toArray().filter(func entry = entry.farolId == farolId);
    let sorted = matching.sort(func (a, b) = Int.compare(b.recordedAt, a.recordedAt));
    sorted.map(positionToView);
  };
};

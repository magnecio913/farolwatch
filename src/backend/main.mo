import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import ListEntity "mo:caffeineai-oql/ListEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import BoolValue "mo:caffeineai-oql/BoolValue";

import SensorTypeValue "SensorTypeValue";
import SensorStatusValue "SensorStatusValue";
import AlertReasonValue "AlertReasonValue";
import OptNatValue "OptNatValue";
import OptFloatValue "OptFloatValue";
import OptIntValue "OptIntValue";

import Map "mo:core/Map";
import List "mo:core/List";

import FarolTypes "types/faroles";
import SensorTypes "types/sensors";
import AlertTypes "types/alerts";
import DeviceTypes "types/devices";

import FarolesApi "mixins/faroles-api";
import SensorsApi "mixins/sensors-api";
import AlertsApi "mixins/alerts-api";
import DevicesApi "mixins/devices-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let faroles : Map.Map<FarolTypes.FarolId, FarolTypes.Farol>;
  let positions : List.List<FarolTypes.PositionEntry>;
  let sensors : Map.Map<SensorTypes.SensorId, SensorTypes.Sensor>;
  let alerts : List.List<AlertTypes.Alert>;
  let devices : Map.Map<DeviceTypes.DeviceId, DeviceTypes.LinkedDevice>;
  let state : {
    var nextFarolId : Nat;
    var nextPositionId : Nat;
    var nextSensorId : Nat;
    var nextAlertId : Nat;
    var nextDeviceId : Nat;
  };

  include FarolesApi(faroles, positions, state);
  include SensorsApi(sensors, state);
  include AlertsApi(sensors, alerts, state);
  include DevicesApi(devices, state);
  include ApiDocMixin();

  include Expose({
    entities = [
      faroles.toEntity("farol", "Farol", "id")
        .sample({
          id = 0;
          name = "";
          qrCode = "";
          latitude = 0.0;
          longitude = 0.0;
          registeredAt = 0;
        })
        .controllerOnly()
        .build(),
      positions.toEntity("position", "PositionEntry", "id")
        .sample({
          id = 0;
          farolId = 0;
          latitude = 0.0;
          longitude = 0.0;
          recordedAt = 0;
        })
        .edge("farolId", "farol")
        .controllerOnly()
        .build(),
      sensors.toEntity("sensor", "Sensor", "id")
        .sample({
          id = 0;
          name = "";
          qrCode = "";
          sensorType = #temperature;
          farolId = null;
          unit = "";
          minValue = 0.0;
          maxValue = 0.0;
          lastValue = null;
          lastReadingAt = null;
          status = #normal;
        })
        .controllerOnly()
        .build(),
      alerts.toEntity("alert", "Alert", "id")
        .sample({
          id = 0;
          sensorId = 0;
          reason = #belowMin;
          value = 0.0;
          message = "";
          createdAt = 0;
          read = false;
        })
        .edge("sensorId", "sensor")
        .controllerOnly()
        .build(),
      devices.toEntity("linkedDevice", "LinkedDevice", "id")
        .sample({ id = 0; name = ""; linkedAt = 0 })
        .controllerOnly()
        .build(),
    ];
  });
};

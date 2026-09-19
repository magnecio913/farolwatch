import OQL "mo:caffeineai-oql";

module {
  /// Optional Float → sentinel 0.0 when absent.
  public func _toRow(self : ?Float) : OQL.Value {
    switch self {
      case null { #float(0.0) };
      case (?f) { #float(f) };
    };
  };
};

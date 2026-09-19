import OQL "mo:caffeineai-oql";

module {
  /// Optional Int → sentinel 0 when absent.
  public func _toRow(self : ?Int) : OQL.Value {
    switch self {
      case null { #int(0) };
      case (?i) { #int(i) };
    };
  };
};

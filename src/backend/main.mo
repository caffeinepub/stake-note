import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Auto-register a caller as #user if they have no role yet
  func ensureRegistered(caller : Principal) {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous callers are not allowed") };
    switch (accessControlState.userRoles.get(caller)) {
      case (?_) {};
      case (null) { accessControlState.userRoles.add(caller, #user) };
    };
  };

  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureRegistered(caller);
    userProfiles.add(caller, profile);
  };

  type EntryId = Nat;

  public type DiaryEntry = {
    id : EntryId;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    moodTags : [Text];
  };

  let allEntries = Map.empty<Principal, Map.Map<EntryId, DiaryEntry>>();
  var nextEntryId = 0;

  func getUserEntriesStrict(caller : Principal) : Map.Map<EntryId, DiaryEntry> {
    switch (allEntries.get(caller)) {
      case (null) { Runtime.trap("No entries found") };
      case (?e) { e };
    };
  };

  public shared ({ caller }) func createEntry(title : Text, body : Text, moodTags : [Text]) : async EntryId {
    ensureRegistered(caller);
    let entry : DiaryEntry = {
      id = nextEntryId; title; body;
      createdAt = Time.now(); updatedAt = Time.now(); moodTags;
    };
    let userEntries = switch (allEntries.get(caller)) {
      case (null) { Map.empty<EntryId, DiaryEntry>() };
      case (?e) { e };
    };
    userEntries.add(nextEntryId, entry);
    allEntries.add(caller, userEntries);
    nextEntryId += 1;
    entry.id;
  };

  public shared ({ caller }) func updateEntry(entryId : EntryId, title : Text, body : Text, moodTags : [Text]) : async () {
    ensureRegistered(caller);
    let userEntries = getUserEntriesStrict(caller);
    switch (userEntries.get(entryId)) {
      case (null) { Runtime.trap("Entry does not exist") };
      case (?existing) {
        userEntries.add(entryId, {
          id = entryId; title; body;
          createdAt = existing.createdAt; updatedAt = Time.now(); moodTags;
        });
      };
    };
  };

  public shared ({ caller }) func deleteEntry(entryId : EntryId) : async () {
    ensureRegistered(caller);
    let userEntries = getUserEntriesStrict(caller);
    if (not userEntries.containsKey(entryId)) { Runtime.trap("Entry does not exist") };
    userEntries.remove(entryId);
  };

  public query ({ caller }) func getEntry(entryId : EntryId) : async ?DiaryEntry {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous callers are not allowed") };
    switch (allEntries.get(caller)) {
      case (null) { null };
      case (?e) { e.get(entryId) };
    };
  };

  public query ({ caller }) func getEntriesByPage(page : Nat, pageSize : Nat) : async [DiaryEntry] {
    if (caller.isAnonymous()) { return [] };
    let userEntries = switch (allEntries.get(caller)) {
      case (null) { return [] };
      case (?e) { e };
    };
    let arr = userEntries.values().toArray().sort(
      func(a, b) {
        switch (Int.compare(b.createdAt, a.createdAt)) {
          case (#equal) { Int.compare(b.updatedAt, a.updatedAt) };
          case (o) { o };
        };
      }
    );
    let start = page * pageSize;
    if (start >= arr.size()) { return [] };
    let end = if (start + pageSize > arr.size()) { arr.size() } else { start + pageSize };
    arr.sliceToArray(start, end);
  };

  public query ({ caller }) func searchEntries(keyword : Text) : async [DiaryEntry] {
    if (caller.isAnonymous()) { return [] };
    let userEntries = switch (allEntries.get(caller)) {
      case (null) { return [] };
      case (?e) { e };
    };
    var results = List.empty<DiaryEntry>();
    for ((_, entry) in userEntries.entries()) {
      if (entry.title.contains(#text keyword) or entry.body.contains(#text keyword)) {
        results.add(entry);
      };
    };
    results.toArray();
  };
};

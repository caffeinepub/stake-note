import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Diary Entry Types
  type EntryId = Nat;

  public type DiaryEntry = {
    id : EntryId;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    moodTags : [Text];
  };

  module DiaryEntry {
    public func compare(entry1 : DiaryEntry, entry2 : DiaryEntry) : Order.Order {
      switch (Int.compare(entry2.createdAt, entry1.createdAt)) {
        case (#equal) { Int.compare(entry2.updatedAt, entry1.updatedAt) };
        case (order) { order };
      };
    };
  };

  let allEntries = Map.empty<Principal, Map.Map<EntryId, DiaryEntry>>();
  var nextEntryId = 0;

  func getUserEntries(caller : Principal) : ?Map.Map<EntryId, DiaryEntry> {
    allEntries.get(caller);
  };

  func getUserEntriesStrict(caller : Principal) : Map.Map<EntryId, DiaryEntry> {
    switch (allEntries.get(caller)) {
      case (null) { Runtime.trap("No entries found for caller") };
      case (?entries) { entries };
    };
  };

  public shared ({ caller }) func createEntry(title : Text, body : Text, moodTags : [Text]) : async EntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create entries");
    };

    let entry : DiaryEntry = {
      id = nextEntryId;
      title;
      body;
      createdAt = Time.now();
      updatedAt = Time.now();
      moodTags;
    };

    let userEntries = switch (allEntries.get(caller)) {
      case (null) { Map.empty<EntryId, DiaryEntry>() };
      case (?entries) { entries };
    };

    userEntries.add(nextEntryId, entry);
    allEntries.add(caller, userEntries);

    nextEntryId += 1;
    entry.id;
  };

  public shared ({ caller }) func updateEntry(entryId : EntryId, title : Text, body : Text, moodTags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update entries");
    };

    let userEntries = getUserEntriesStrict(caller);
    switch (userEntries.get(entryId)) {
      case (null) { Runtime.trap("Entry does not exist") };
      case (?existingEntry) {
        let updatedEntry : DiaryEntry = {
          id = entryId;
          title;
          body;
          createdAt = existingEntry.createdAt;
          updatedAt = Time.now();
          moodTags;
        };
        userEntries.add(entryId, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func deleteEntry(entryId : EntryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    let userEntries = getUserEntriesStrict(caller);
    if (not userEntries.containsKey(entryId)) {
      Runtime.trap("Entry does not exist");
    };
    userEntries.remove(entryId);
  };

  public query ({ caller }) func getEntry(entryId : EntryId) : async ?DiaryEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access entries");
    };

    switch (allEntries.get(caller)) {
      case (null) { null };
      case (?entries) { entries.get(entryId) };
    };
  };

  public query ({ caller }) func getEntriesByPage(page : Nat, pageSize : Nat) : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access entries");
    };

    let userEntries = switch (allEntries.get(caller)) {
      case (null) { return [] };
      case (?entries) { entries };
    };

    let allEntriesArr = userEntries.values().toArray().sort();

    let startIndex = page * pageSize;
    if (startIndex >= allEntriesArr.size()) { return [] };

    let endIndex = if (startIndex + pageSize > allEntriesArr.size()) {
      allEntriesArr.size();
    } else { startIndex + pageSize };

    allEntriesArr.sliceToArray(startIndex, endIndex);
  };

  public query ({ caller }) func searchEntries(keyword : Text) : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access entries");
    };

    let userEntries = switch (allEntries.get(caller)) {
      case (null) { return [] };
      case (?entries) { entries };
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

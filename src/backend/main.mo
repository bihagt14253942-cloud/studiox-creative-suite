import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Types for creative projects
  type Project = {
    id : Text;
    name : Text;
    owner : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    stateJson : Text;
    assetIds : [Text];
  };

  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  // Types for different asset media
  type AssetType = { #image; #video; #audio };

  // Asset metadata structure
  type AssetMetadata = {
    id : Text;
    name : Text;
    assetType : AssetType;
    size : Nat;
    blobId : Text;
    projectId : Text;
  };

  module AssetMetadata {
    public func compare(a1 : AssetMetadata, a2 : AssetMetadata) : Order.Order {
      Text.compare(a1.id, a2.id);
    };
  };

  // Project and asset storage
  let projects = Map.empty<Text, Project>();
  let assets = Map.empty<Text, AssetMetadata>();

  // Helper function to verify project ownership
  private func verifyProjectOwnership(caller : Principal, projectId : Text) : () {
    let project = switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?p) { p };
    };
    if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only project owner can perform this action");
    };
  };

  // Create new project
  public shared ({ caller }) func createProject(id : Text, name : Text, stateJson : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };
    if (projects.containsKey(id)) { Runtime.trap("Project already exists") };
    let timestamp = Time.now();
    let project : Project = {
      id;
      name;
      owner = caller;
      createdAt = timestamp;
      updatedAt = timestamp;
      stateJson;
      assetIds = [];
    };
    projects.add(id, project);
  };

  // Update existing project
  public shared ({ caller }) func updateProject(id : Text, project : Project) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };
    let existing = switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?p) { p };
    };
    if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only project owner can update");
    };
    projects.add(id, { project with updatedAt = Time.now() });
  };

  // Delete project
  public shared ({ caller }) func deleteProject(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };
    let project = switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?p) { p };
    };
    if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only project owner can delete");
    };
    projects.remove(id);
  };

  // Get single project
  public query ({ caller }) func getProject(id : Text) : async ?Project {
    let project = switch (projects.get(id)) {
      case (null) { return null };
      case (?p) { p };
    };
    if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own projects");
    };
    ?project;
  };

  // List projects by owner
  public query ({ caller }) func getProjectsByOwner(owner : Principal) : async [Project] {
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own projects");
    };
    projects.values().toArray().filter(
      func(p) { p.owner == owner }
    ).sort();
  };

  // List all projects (admin only)
  public query ({ caller }) func listAllProjects() : async [Project] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    projects.values().toArray().sort();
  };

  // Create asset metadata
  public shared ({ caller }) func createAsset(metadata : AssetMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create assets");
    };
    if (assets.containsKey(metadata.id)) { Runtime.trap("Asset already exists") };
    verifyProjectOwnership(caller, metadata.projectId);
    assets.add(metadata.id, metadata);
  };

  // Create multiple assets in bulk
  public shared ({ caller }) func createAssets(metadataArray : [AssetMetadata]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create assets");
    };
    for (metadata in metadataArray.values()) {
      if (assets.containsKey(metadata.id)) { Runtime.trap("Asset already exists") };
      verifyProjectOwnership(caller, metadata.projectId);
      assets.add(metadata.id, metadata);
    };
  };

  // Update asset metadata
  public shared ({ caller }) func updateAsset(metadata : AssetMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update assets");
    };
    if (not assets.containsKey(metadata.id)) { Runtime.trap("Asset does not exist") };
    verifyProjectOwnership(caller, metadata.projectId);
    assets.add(metadata.id, metadata);
  };

  // Delete asset metadata
  public shared ({ caller }) func deleteAsset(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete assets");
    };
    let asset = switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset does not exist") };
      case (?a) { a };
    };
    verifyProjectOwnership(caller, asset.projectId);
    assets.remove(id);
  };

  // Get single asset metadata
  public query ({ caller }) func getAssetMetadata(id : Text) : async ?AssetMetadata {
    let asset = switch (assets.get(id)) {
      case (null) { return null };
      case (?a) { a };
    };
    verifyProjectOwnership(caller, asset.projectId);
    ?asset;
  };

  // Get assets by project
  public query ({ caller }) func getAssetsByProject(projectId : Text) : async [AssetMetadata] {
    verifyProjectOwnership(caller, projectId);
    assets.values().toArray().filter(
      func(a) { a.projectId == projectId }
    ).sort();
  };

  // Re-index the entire backend canister (admin only)
  public shared ({ caller }) func reindex() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    // Normally reindexing logic would be implemented here (e.g. rebuilding search indexes)
  };
};

pub use error::{ScrabblebagError, ScrabbebagResult};

pub use hdk::prelude::Path;
pub use hdk::prelude::*;
use hdk::prelude::holo_hash::AgentPubKeyB64;

pub mod error;
pub mod signals;


entry_defs![
    PathEntry::entry_def()
];
  
#[hdk_extern]
fn get_players(_:()) -> ExternResult<Vec<AgentPubKeyB64>> {
    let path = Path::from("Players".to_string());
    let links = get_links(path.path_entry_hash()?, None)?;
    Ok(links.into_iter().map(|link| {
        let agent = AgentPubKey::from(link.target);
        AgentPubKeyB64::from(agent)
    }).collect())
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    // grant unrestricted access to accept_cap_claim so other agents can send us claims
    let mut functions = BTreeSet::new();
    functions.insert((zome_info()?.name, "recv_remote_signal".into()));
    functions.insert((zome_info()?.name, "recv_fulfillment".into()));
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        // empty access converts to unrestricted
        access: ().into(),
        functions,
    })?;
    
    let path = Path::from("Players".to_string());
    path.ensure()?;
    let me: AgentPubKey = agent_info()?.agent_latest_pubkey;
    create_link(path.path_entry_hash()?,me.into(),())?;

    Ok(InitCallbackResult::Pass)
}

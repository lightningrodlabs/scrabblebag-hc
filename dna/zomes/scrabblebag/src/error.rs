use hdk::prelude::*;
use std::convert::Infallible;

#[derive(thiserror::Error, Debug)]
pub enum ScrabblebagError {
    #[error(transparent)]
    Serialization(#[from] SerializedBytesError),
    #[error(transparent)]
    Infallible(#[from] Infallible),
    #[error(transparent)]
    EntryError(#[from] EntryError),
    #[error("Failed to convert an agent link tag to an agent pub key")]
    AgentTag,
    #[error(transparent)]
    Wasm(#[from] WasmError),
    #[error(transparent)]
    Timestamp(#[from] TimestampError),
}

pub type ScrabbebagResult<T> = Result<T, ScrabblebagError>;

impl From<ScrabblebagError> for WasmError {
    fn from(c: ScrabblebagError) -> Self {
        WasmError::Guest(c.to_string())
    }
}

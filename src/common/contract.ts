import { Contract, NoteMetadataAttachmentBase } from "crossbell.js";
import type { NoteMetadata } from "crossbell.js";
import { ethers } from "ethers";
import { uploadFile, uploadJson } from "./ipfs";
import { Photo } from "@mui/icons-material";

let gContract: Contract | null = null;
let signerAddress: string = "";

let characterId: number = 0;

export const setContractCharacterHandle = async (handle: string) => {
  const res = await fetch(
    `https://indexer.crossbell.io/v1/handles/${handle}/character`
  ).then((res) => res.json());
  characterId = res.characterId;
};

export const initWithPrivateKey = async (privateKey: string) => {
  if (!privateKey) {
    throw new Error("No private key provided");
  }

  if (!privateKey.startsWith("0x")) {
    privateKey = `0x${privateKey}`;
  }

  try {
    // Initialize wallet address
    const w = new ethers.Wallet(privateKey);
    signerAddress = w.address;

    // Initialize contract instance
    gContract = new Contract(privateKey);
    await gContract.connect();
  } catch (e) {
    gContract = null;
    signerAddress = "";
    throw e;
  }
};

const getMetamaskProvider = async (): Promise<Contract> => {
  const provider = (window as any).ethereum;
  const uContract = new Contract(provider);
  await uContract.connect();
  return uContract;
};

export const generateRandomPrivateKey = () => {
  const randWallet = ethers.Wallet.createRandom();
  return randWallet.privateKey;
};

export const getSignerAddress = (): string => {
  if (gContract === null) {
    throw new Error("Contract not initialized.");
  }

  return signerAddress;
};

export const getSignerBalance = async (): Promise<number> => {
  if (gContract === null) {
    throw new Error("Contract not initialized.");
  }

  const { data: csb } = await gContract.getBalance(signerAddress);
  if (csb) {
    return parseInt(csb);
  } else {
    return -1;
  }
};

export const checkOperator = async (): Promise<boolean> => {
  if (gContract === null) {
    throw new Error("Contract not initialized.");
  }

  // Check if is owner
  const characterData = await fetch(
    `https://indexer.crossbell.io/v1/characters/${characterId}`
  ).then((res) => res.json());
  if (signerAddress.toLowerCase() === characterData.owner?.toLowerCase()) {
    // Is owner
    console.log("Signer is owner");
    return true;
  }

  // Otherwise need operator authorization
  const { data: permissions } =
    await gContract.getOperatorPermissionsForCharacter(
      characterId,
      signerAddress
    );

  console.log("Signer permissions: ", permissions);

  return permissions.includes("POST_NOTE");
};

export const addOperator = async () => {
  if (gContract === null) {
    throw new Error("Contract not initialized.");
  }

  // Set operator
  const uProvider = await getMetamaskProvider();
  await uProvider.grantOperatorPermissionsForCharacter(
    characterId,
    signerAddress,
    ["POST_NOTE"]
  );
};

export const removeOperator = async () => {
  if (gContract === null) {
    throw new Error("Contract not initialized.");
  }

  // Remove Operator
  const uProvider = await getMetamaskProvider();
  await uProvider.grantOperatorPermissionsForCharacter(
    characterId,
    signerAddress,
    []
  );
};

export interface WechatExportMedia {
  content: string;
  description: string;
  id: string;
  title: string;
  type: string;
}

export interface WechatExportMoment {
  appname?: string;
  contenturl?: string;
  title?: string;
  sourcenickname?: string;
  content?: string;
  create_time: string;
  medias: WechatExportMedia[] | null;
  poi?: string;
  type: string;
  username: string;
}

export const signerPostNote = async (moment: WechatExportMoment) => {
  if (gContract === null) {
    throw new Error("Contract not initialized.");
  }

  // Upload medias to IPFS
  const mediaAttachments: NoteMetadataAttachmentBase<"address">[] = [];
  if (moment.medias?.length) {
    // Has photo
    for (const media of moment.medias) {
      const mediaFileName = `${media.content.split("/").pop()}`;
      const result = await fetch(media.content);
      const blob = await result.blob();
      const ipfsUri = await uploadFile(blob);
      mediaAttachments.push({
        name: mediaFileName,
        address: ipfsUri,
        mime_type: blob.type,
        size_in_bytes: blob.size,
        alt: media.description,
      });
    }
  }

  // Upload note
  const note: NoteMetadata = {
    type: "note",
    sources: ["W2C", "WeChat"],
    title: moment.title,
    content: moment.content,
    attachments: mediaAttachments,
    date_published: new Date(moment.create_time).toISOString(),
  };

  const noteIPFSUri = await uploadJson(note);

  // Push on chain
  if (moment.contenturl) {
    await gContract.postNoteForAnyUri(
      characterId,
      noteIPFSUri,
      moment.contenturl
    );
  } else {
    await gContract.postNote(characterId, noteIPFSUri);
  }
};

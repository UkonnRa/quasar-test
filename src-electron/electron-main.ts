import { app, BrowserWindow } from "electron";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import * as process from "node:process";

import {
  Account,
  AccountQuery,
  AccountServiceClient,
} from "./proto/gen/whiterabbit/account/v1/account";
import {
  Journal,
  JournalQuery,
  JournalServiceClient,
} from "./proto/gen/whiterabbit/journal/v1/journal";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL(".", import.meta.url));

let mainWindow: BrowserWindow | undefined;
let journalClient: JournalServiceClient | undefined;
let accountClient: AccountServiceClient | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, "icons/icon.png"), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          "electron-preload" + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  });

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL);
  } else {
    mainWindow.loadFile("index.html");
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(() => {
  journalClient = new JournalServiceClient(
    process.env.VITE_API_URL_BASE ?? "[::1]:50051",
    ChannelCredentials.createInsecure(),
  );
  accountClient = new AccountServiceClient(
    process.env.VITE_API_URL_BASE ?? "[::1]:50051",
    ChannelCredentials.createInsecure(),
  );

  const metadata = new Metadata();
  metadata.set("authorization", "Bearer some-secret-token");
  journalClient.findAll(
    { query: JournalQuery.fromPartial({}) },
    metadata,
    (err, resp) => {
      if (err) {
        console.error("Error when finding journals: ", err);
      } else {
        accountClient!.findAll(
          {
            query: AccountQuery.fromPartial({ journalId: [resp.values[0].id] }),
          },
          metadata,
          (err, resp) => {
            if (err) {
              console.error("Error when finding account: ", err);
            } else {
              console.log("Find Accounts: ", resp.values);
              for (const [id, { typeUrl, value }] of Object.entries(
                resp.included,
              )) {
                if (typeUrl === "/whiterabbit.account.v1.Account") {
                  const decoded = Account.decode(value);
                  console.log("  Account - Id: ", id, ", decoded: ", decoded);
                } else if (typeUrl === "/whiterabbit.journal.v1.Journal") {
                  const decoded = Journal.decode(value);
                  console.log("  Journal - Id: ", id, ", decoded: ", decoded);
                } else {
                  console.error("No typeUrl found");
                }
              }
            }
          },
        );
      }
    },
  );

  createWindow();
});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

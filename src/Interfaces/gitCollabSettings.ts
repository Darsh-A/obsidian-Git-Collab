export interface gitCollabSettings {

    username: string;
    token: string;

    gitHubUrl: string;
    checkInterval: number;
    checkTime: number;
    owner: string;
    repo: string;

    notice: boolean;
    noticePrompt: string;

    status: boolean;

    debugMode: boolean;
    cronDebugLogger: boolean;
    commitDebugLogger: boolean;

    allFormatting: boolean;
    settingsNotSetStatus: string;
    settingsNotSetLabel: string;
    noCommitsFoundStatus: string;
    noCommitsFoundLabel: string;
    fileEditableStatus: string;
    fileNotEditableStatus: string;

    ribbon: boolean;
    ribbonCheckInterval: number;
    ribbonDisplayPath: boolean;
    ribbonModalTitleCSS: string;
    ribbonModalFetchingCommitsCSS: string;
    ribbonModalNoCommitsCSS: string;
    ribbonModalNoCommitsText: string;
    ribbonModalAuthorCSS: string;
    ribbonModalFileNameCSS: string;
    ribbonModalFilePathCSS: string;
}
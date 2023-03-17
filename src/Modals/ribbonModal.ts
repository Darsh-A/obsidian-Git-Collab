import { App, Modal} from "obsidian";
import { Octokit } from "octokit";
import { fetchCommits } from "src/gitFunctions";
import { gitCollabSettings } from "src/Interfaces/gitCollabSettings";
import { fileURLToPath } from "url";

export class CommitsModal extends Modal {
  Octokit: Octokit;
  settings: gitCollabSettings;

  constructor(app: App, Octokit: Octokit, settings: gitCollabSettings) {
    super(app);
    this.Octokit = Octokit;
    this.settings = settings;
  }

  async onOpen() {

    const { contentEl, titleEl } = this;

    titleEl.createEl("div", { text: "Git-Collab", attr: { style: this.settings.ribbonModalTitleCSS } });
    contentEl.createEl("div", { text: `Fetching commits in the past ${this.settings.ribbonCheckInterval} minutes.`, attr: { style: this.settings.ribbonModalFetchingCommitsCSS } });

    if (this.settings.ribbonCheckInterval > 60) {
      contentEl.createEl("div", { text: `This may take a while....`, attr: { style: this.settings.ribbonModalFetchingCommitsCSS } });
    }

    const editorMap = await this.convertToEditorMap();
    contentEl.empty();

    if (editorMap.size == 0) {
      contentEl.createEl("div", { text: this.settings.ribbonModalNoCommitsText, attr: { style: this.settings.ribbonModalNoCommitsCSS } });
      return;
    }

    for (const [key, value] of editorMap.entries()) {

      const authorEl = contentEl.createEl("a", { text: key, attr: { href: value[0].get('authorGitHub'), style: this.settings.ribbonModalAuthorCSS } });
      const authorWorks = contentEl.createEl("div");
  
      for (let i = 0; i < value.length; i++) {
        const contentDiv = authorWorks.createEl("div");
        contentDiv.createEl("a", { text: `• ${value[i].get('fileName')}`, attr: { href: value[i].get('commitUrl'), style: this.settings.ribbonModalFileNameCSS } });
        if (this.settings.ribbonDisplayPath){
          contentDiv.createEl("small", { text: value[i].get('filePath'), attr: { style: this.settings.ribbonModalFilePathCSS } });
        }
      }
    }
  }

  private async convertToEditorMap() {

    const fileMap = await fetchCommits(this.Octokit, this.settings, this.settings.ribbonCheckInterval);
    const authors: string[] = new Array(...new Set(Object.values(fileMap).map((item: any) => item.authorName)));

    const editorMap = new Map();
    authors.forEach( author => {
      editorMap.set(author, []);
    });

    for (let i = 0; i < authors.length; i++) {
      for (const [key, value] of Object.entries(fileMap)) {
        if (value.authorName == authors[i]) {

          const detailsMap = new Map();
          detailsMap.set('filePath', key);
          detailsMap.set('fileName', key.split('/').pop());
          detailsMap.set('authorName', value.authorName);
          detailsMap.set('authorGitHub', value.authorGitHub);
          detailsMap.set('commitMessage', value.commitMessage);
          detailsMap.set('commitUrl', value.commitUrl);
          editorMap.get(authors[i]).push(detailsMap);

        }
      }
    }

    return editorMap;
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
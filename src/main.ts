import { Modal, Notice, Plugin} from 'obsidian';
import { Octokit } from 'octokit';
import { gitCollabSettingTab } from 'src/settings';
import { fetchCommits } from './gitFunctions';
import { gitCollabSettings } from './Interfaces/gitCollabSettings';
import { CommitsModal} from './Modals/ribbonModal';
var cron = require('node-cron');

export default class gitCollab extends Plugin {

    settings: gitCollabSettings;
    workspace: any;

    async onload() {

        console.log('Git-Collab Loaded!!!');

        //Load settings
        await this.loadSettings();
        this.addSettingTab(new gitCollabSettingTab(this.app, this));

        const statusBarItemEl = this.addStatusBarItem();

        //Add status bar item
        if (this.settings.status == true) {
            statusBarItemEl.setText('Loading Git-Collab...');
        }

        //Check if the settings are set
        if (this.settings.token == '' || this.settings.gitHubUrl == '') {
            statusBarItemEl.setText(this.settings.settingsNotSetStatus);
            statusBarItemEl.ariaLabel = this.settings.settingsNotSetLabel;
            new Notice('Please set the settings for Git-Collab');
            return;
        }

        if (this.settings.owner == '' || this.settings.repo == '') {

            //regex to check if a link is a gitHub repo
            const regex = new RegExp(/^(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/);

            if (regex.test(this.settings.gitHubUrl)) {
                const url = this.settings.gitHubUrl.split('/');
                
                this.settings.owner = url[url.length - 2];
                this.settings.repo = url[url.length - 1];

                if (this.settings.repo.includes('.git')){
                    this.settings.repo = this.settings.repo.replace('.git','');
                }

                if (this.settings.debugMode && this.settings.commitDebugLogger){
                    console.log(`Git Collab: Owner: ${this.settings.owner} Repo: ${this.settings.repo}`);
                }
                
                this.saveSettings();

            }
            else {
                new Notice('Please enter a valid GitHub URL');
                return;
            }
            
        }

        //Github Authentication
        const octokit = new Octokit({
            auth: this.settings.token,
        });

        if (this.settings.status){
            statusBarItemEl.setText(this.settings.noCommitsFoundStatus);
            statusBarItemEl.ariaLabel = this.settings.noCommitsFoundLabel;
        }

        //Add ribbon button
        if (this.settings.ribbon){
            this.addRibbonIcon('users', 'Git-Collab', () => {
                new CommitsModal(this.app, octokit, this.settings).open();
            });
        }

        //Cron Job
        const cronJob: String = `*/${this.settings.checkInterval} * * * * *`
        cron.schedule(cronJob,async () => {

            if (this.settings.debugMode && this.settings.cronDebugLogger){
                console.log(`Git Collab: Cron task started with a timer of ${this.settings.checkInterval}`);
            }

            const fileMap = await fetchCommits(octokit, this.settings, this.settings.checkInterval);

            if (Object.keys(fileMap).length == 0) {
                if (this.settings.debugMode && this.settings.commitDebugLogger){
                    console.log(`Git Collab: No commits found`);
                }
                return;    
            }
            else if (this.settings.debugMode && this.settings.cronDebugLogger){
                console.log(`Git Collab: Commits fetched`);
            }

            const filenames: string[] = [];
            for (const [filePath, commitData] of Object.entries(fileMap)) {
                const fName = filePath.split('/').pop();
                const author = commitData.authorName;
                filenames.push(`${fName}: ${author}`);
            }

            console.log(`Git Collab FileNames: ${filenames}`);

            if (this.settings.notice || this.settings.status) {

                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    statusBarItemEl.setText(this.settings.noCommitsFoundStatus);
                    statusBarItemEl.ariaLabel = 'Please open a file gor status bar to work';
                    return;
                }

                const author = fileMap.get(activeFile.path)?.authorName;
                const vaultOwner = this.settings.username;

                if (this.settings.notice) {
                    if (author && author != vaultOwner) {
                        const noticePromptWords : string[] = this.settings.noticePrompt.split(' ');
                        noticePromptWords.forEach((word, index) => {
                            if (word == '$author') {
                                noticePromptWords[index] = author;
                            }
                            else if (word == '$fileName') {
                                noticePromptWords[index] = activeFile.basename;
                            }
                        });
                        const noticePrompt = noticePromptWords.join(' ');
                        new Notice(noticePrompt);
                    }
                }

                if (this.settings.status) {
                    if (author && author != vaultOwner) {
                        statusBarItemEl.setText(this.settings.fileNotEditableStatus);
                        statusBarItemEl.ariaLabel = filenames.join('\n')
                    }
                    else {
                        statusBarItemEl.setText(this.settings.fileEditableStatus);
                        statusBarItemEl.ariaLabel = filenames.join('\n')
                    }
                }
            }
        });                
    }

    onunload() {
            console.log('Git Collab: Unloading Plugin')
    }

    async loadSettings() {
        
        const DEFAULT_SETTINGS: gitCollabSettings = {

            username: '',
            token: '',

            gitHubUrl: '',
            owner: '',
            repo: '',
            checkInterval: 15,
            checkTime: 2,

            allFormatting: false,
        
            notice: true,
            noticePrompt: 'This file is being edited by $author',

            status: true,
            settingsNotSetStatus: '✖',
            settingsNotSetLabel: 'Settings have not been set.',
            noCommitsFoundStatus: '✔',
            noCommitsFoundLabel: 'No commits found enjoy writing notes!',
            fileEditableStatus: '✔',
            fileNotEditableStatus: '✖',
        
            debugMode: false,
            cronDebugLogger: false,
            commitDebugLogger: false,

            ribbon: true,
            ribbonCheckInterval: 15,
            ribbonDisplayPath: false,
            ribbonModalTitleCSS: "text-align: center; font-size: 50px; color: var(--color-green); padding-bottom: 10px;",
            ribbonModalFetchingCommitsCSS: "text-align: left; font-size: 20px; color: var(--color-blue);",
            ribbonModalNoCommitsCSS: "text-align: center; font-size: 30px; color: var(--color-red);",
            ribbonModalNoCommitsText: "No Commits Found",
            ribbonModalAuthorCSS: "text-align: left; font-size: 35px; color: var(--color-red);  padding-left: 20px;",
            ribbonModalFileNameCSS: "text-align: left; font-size: 25px; color: var(--text-normal);",
            ribbonModalFilePathCSS: "text-align: left; font-size: 15px; color: var(--text-muted);",
        
        };
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

}
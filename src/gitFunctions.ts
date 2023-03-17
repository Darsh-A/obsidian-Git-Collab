import { Octokit } from "octokit";
import { gitCollabSettings } from "./Interfaces/gitCollabSettings";
import { commitData } from "./Interfaces/commitData";

export async function fetchCommits(octokit: Octokit, settings: gitCollabSettings, timeInterval: number): Promise<Map<String, commitData>> {

    const time_rn = new Date();
    const time_bf = new Date(time_rn.getTime() - timeInterval * 60000);

    const response = await octokit.request("GET /repos/{owner}/{repo}/commits{?since,until,per_page,page}", {
      owner: settings.owner,
      repo: settings.repo,
      since: time_bf.toISOString(),
      until: time_rn.toISOString(),
      per_page: 100,
      page: 1,
    });


    const sha = [];
    for (let i = 0; i < response.data.length; i++) {
      sha.push(response.data[i].sha);
    }

    const commits = [];
    for (let i = 0; i < sha.length; i++) {

      const response2 = await octokit.request("GET /repos/{owner}/{repo}/commits/{sha}", {
        owner: settings.owner,
        repo: settings.repo,
        ref: 'main',
        sha: sha[i]
      });

      if (response2.data.commit.message.includes('vault backup')) {
        commits.push(response2.data);
      }

    }

    const filenames: string[] = [];
    const files: any = [];
    const fileMap: any = {};
    for (let i = 0; i < commits.length; i++) {
      for (let j = 0; j < commits[i].files.length; j++) {
        filenames.indexOf(`${commits[i].commit.author.name} - ${commits[i].files[j].filename}`) == -1 ? filenames.push(`${commits[i].commit.author.name} - ${commits[i].files[j].filename}`) : null;
        files.indexOf(commits[i].files[j].filename) == -1 ? files.push(commits[i].files[j].filename) : null;

        const data: commitData = {
          authorName: commits[i].author.login,
          authorGitHub: commits[i].author.html_url,
          commitUrl: commits[i].html_url,
        };
        fileMap[commits[i].files[j].filename] = data;
      }
    }

    return fileMap;
}
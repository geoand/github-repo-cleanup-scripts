const axios = require('axios');
const fs = require('fs');
const config = require('./config');

const username = config.github_username;
const URL = `https://api.github.com/users/${username}/repos`;

async function fetchRepos(url) {
	const result = [];

	let getPage = async function(page) {
		if (!page) page = 1;
		return axios.get(url, {
			params: {
				page: page,
				access_token: config.access_token,
			},
		}).then(res => {
			repoCount = 0;
			if (res.data) {
				const repos = res.data.map(repo => repo.full_name);
				if (repos) {
					console.log(`Fetched ${repos.length} repos on page ${page}:`);
					for (let r of repos) {
						if (result.indexOf(r) === -1) {
							result.push(r);
							console.log(r);
						}
					}
					if (repos.length > 0) {
						return getPage(page + 1);
					}
				}
			}
		}).catch(err => {
			console.error(`Error fetching page ${page}: ${err}`);
		});
	}

	return getPage(1).then(() => {
		return result;
	});
}

fetchRepos(URL).then(result => {
	console.log('Forked repos found:', result.length);
	console.log(result);
	fs.writeFileSync('repos.json', JSON.stringify(result, null, 2));
});
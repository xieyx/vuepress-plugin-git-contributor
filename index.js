const path = require('path')
const spawn = require('cross-spawn')

module.exports = (options = {}, context) => ({
  extendPageData ($page) {
    const { size = 32, source = 'Gitlab' } = options
    const contributors = getAllGitContributor($page._filePath)
    const creator = getFileCreator($page._filePath)

    $page.contributors = contributors ? contributors.split('\n').reduce((v, k) => {
      if (v.indexOf(k) === -1) {
        v.push(k)
      }
      return v
    }, []).map((contributor) => {
      return {
        email: contributor,
        avatar: getAvatar(contributor, size, source),
      }
    }) : []
    $page.creator = creator ? {email: creator, avatar: getAvatar(creator, size, source)} : {}
  }
})

function getAllGitContributor (filePath)
{
  try {
    return spawn.sync(
      'git',
      ['log', '--pretty=format:"%ae%x09"', path.basename(filePath)],
      { cwd: path.dirname(filePath) }
    ).stdout.toString('utf-8').replace(/^"|\s*"$/mg, '')
  } catch (e) { /* do not handle for now */ }
  return false
}

function getFileCreator (filePath)
{
  try {
    return spawn.sync(
      'git',
      ['log', '-1', '--pretty=format:"%ae%x09"', path.basename(filePath)],
      { cwd: path.dirname(filePath) }
    ).stdout.toString('utf-8').replace(/^"|\s*"$/g, '')
  } catch (e) { /* do not handle for now */ }
  return false
}

function getAvatar (email, size, source)
{
  let avatar;
  switch (source.toLocaleLowerCase()) {
    case 'gitlab':
      avatar = getGitlabAvatar(email, size)
      break;
    case 'github':
      avatar = getGithubAvatar(email, size)
      break;
    default:
      return ''
  }

  return avatar ? JSON.parse(avatar).avatar_url : ''
}

function getGitlabAvatar (email, size)
{
  try {
    // avatar_url
    return spawn.sync(
      'curl',
      [`https://git.staff.sina.com.cn/api/v4/avatar?email=${email}&size=${size}`]
    ).stdout.toString('utf-8')
  } catch (e) { /* do not handle for now */ }
  return false;
}

function getGithubAvatar (email)
{
  try {
    // avatar_url
    return spawn.sync(
      'curl',
      [`https://api.github.com/users/${email.replace(/@.*$/, '')}`]
    ).stdout.toString('utf-8')
  } catch (e) { /* do not handle for now */ }
  return false;
}

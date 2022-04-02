// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import shell from 'shelljs'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && !req.body?.dates ) return

  // console.log({dates: req.body?.dates})

  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }

  shell.echo('Removing empty commits.')
  if (shell.exec('git filter-branch -f --prune-empty').code !== 0) {
    shell.echo('Error: failed');
    res.status(500).end()
  } else {
    shell.echo('Done')
  }
  
  shell.echo('Generating fake commits')
  if( req.body.dates.some((date: string) => {
    return shell.exec(`git commit --allow-empty --date="${date} @ 12:00" -m "github-contributions-doodler - ${date}"`).code !== 0
  }) ) {
    shell.echo('Error: check your git history. ')
    res.status(500).end()
  } else {
    shell.echo('Done')
  }

  res.status(200)

}

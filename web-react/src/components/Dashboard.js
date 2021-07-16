import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import { Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

// import BGI from './BGI'
import CASIC from './CASIC'
import CSIC from './CSIC'
import CEC from './CEC'

// import UserCount from './UserCount'

export default function Dashboard() {
  const theme = useTheme()

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 480,
    },
  }))
  const classes = useStyles(theme)
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)

  return (
    <React.Fragment>
      <Grid container spacing={4}>
        {/* BGI */}
        {/*<Grid item xs={12} md={6} lg={6}>*/}
        {/*<Paper className={fixedHeightPaper}>*/}
        {/*<BGI />*/}
        {/*</Paper>*/}
        {/*</Grid>*/}
        {/*/!* User Count *!/*/}
        {/*<Grid item xs={12} md={8} lg={7}>*/}
        {/*<Paper className={fixedHeightPaper}>*/}
        {/*<UserCount />*/}
        {/*</Paper>*/}
        {/*</Grid>*/}
        {/* CASIC */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper className={fixedHeightPaper}>
            <CASIC />
          </Paper>
        </Grid>
        {/* CSIC */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <CSIC />
          </Paper>
        </Grid>
        {/* CEC */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <CEC />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

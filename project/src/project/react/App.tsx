import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import BlockDrawer from './BlocksDrawer';
import { Switch } from '@mui/material';
import ModuleMenu from './ModuleMenu';
import BuildUI from './BuildUI';
import RunUI from './RunUI';
import { Designer } from '../Designer';
import { Project } from '../Project';
import { FXContext, FXSnippet } from '../../helpers/FXSnippet';
import Onboarding from './Onboarding';

enum MODES {
  BUILD = 'build',
  RUN = 'execute'
}


let setDesignerInstance = (instance:Designer) => {designerInstance = instance; };
let designerInstance:Designer = null;
let isOnboardingOpen = ():boolean => {return false};
export {setDesignerInstance, isOnboardingOpen};

/**
 * React root
 * @returns 
 */
export default function MachineApp() {

  
  const [machineMode, setMachineMode] = React.useState( (Project.GetContext() == FXContext.MINTING)?MODES.BUILD:MODES.RUN);
  const [onboardingOpen, setOnboardingOpen] = React.useState(true);

  const [showAutoWarning, setShowAutoWarning] = React.useState(true);
  const [showDeleteWarning, setShowDeleteWarning] = React.useState(true);

  isOnboardingOpen = ():boolean => {
    return onboardingOpen;
  }

  function onBuildModeChange() {
    setMachineMode(MODES.RUN);
    if( designerInstance != null){
      designerInstance.setMode(MODES.RUN);
    }
  }

  function onRunModeChange() {
    setMachineMode(MODES.BUILD);
    if( designerInstance != null){
      designerInstance.setMode(MODES.BUILD);
    }
  }

  function handleOnboardingClose()
  {
    setOnboardingOpen(false);
  }

  function handleDeleteWarningChange(value:boolean)
  {
    setShowDeleteWarning(value);
  }


  function handleAutoWarningChange(value:boolean)
  {
    setShowAutoWarning(value);
  }

  function GetUI(){
    
    if( Project.GetContext() == FXContext.MINTING || (Project.GetContext() == FXContext.STANDALONE && Project.SUPER_SECRET_CHEAT_MODE_ENABLED) )
    {
      if(machineMode === MODES.BUILD){
        return (
          <div>
            <Onboarding open={onboardingOpen} onClose={handleOnboardingClose}/>
            <BuildUI 
              changeModeCallback={onBuildModeChange} 
              showAutoWarning={showAutoWarning} 
              showDeleteWarning={showDeleteWarning}
              updateShowAutoWarning={handleAutoWarningChange} 
              updateShowDeleteWarning={handleDeleteWarningChange}
            />
          </div>
        )
      }
      else{
        return (
          <RunUI changeModeCallback={onRunModeChange}/>
        )
      }
    }
    else 
    {
      return (
        <RunUI changeModeCallback={onRunModeChange}/>
      )
    }

  }

  return (
    <Box >
      <GetUI/>
    </Box>
  );
}
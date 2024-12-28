import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";


function InfoTab(handleChange: any) {
    return (
        <FormGroup>
            <FormControlLabel   onChange={handleChange("+")} control={<Checkbox defaultChecked />} label="Addition" />
            <FormControlLabel   onChange={handleChange("-")} control={<Checkbox defaultChecked />} label="Subtraction" />
            <FormControlLabel   onChange={handleChange("*")} control={<Checkbox defaultChecked />} label="Multiplication" />
        </FormGroup>
    )
}



export default InfoTab
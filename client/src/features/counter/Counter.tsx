import { Box, Button, ButtonGroup, List, ListItemText, Paper, Typography } from "@mui/material";
import { useStore } from "../../lib/hooks/useStore";
import { observer } from "mobx-react-lite";

const counter = observer(function Counter() {
  const { counterStore } = useStore();
  return (
    <Box
      display="flex"
      justifyContent="space-between"
    >
      <Box sx={{ width: "60%" }}>
        <Typography
          variant="h4"
          gutterBottom
        >
          {counterStore.title}
        </Typography>
        <Typography variant="h6">The count is: {counterStore.count}</Typography>
        <ButtonGroup>
          <Button
            onClick={() => counterStore.increment()}
            variant="contained"
            color="success"
          >
            Increment
          </Button>
          <Button
            onClick={() => counterStore.increment(5)}
            variant="contained"
            color="primary"
          >
            Increment by 5
          </Button>
          <Button
            onClick={() => counterStore.decrement()}
            variant="contained"
            color="error"
          >
            Decrement
          </Button>
        </ButtonGroup>
      </Box>
      <Paper sx={{ width: "40%", p: 4 }}>
        <Typography variant="h5">Counter Events ({counterStore.eventCount})</Typography>
        <List>
          {counterStore.events.map((event, index) => (
            <ListItemText key={index}>{event}</ListItemText>
          ))}
        </List>
      </Paper>
    </Box>
  );
});

export default counter;

/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { LoginLayout } from "./LoginLayout";
import { useSession } from "./auth";
import {
  Layer,
  Toolbar,
  Button,
  Text,
  Navbar,
  theme,
  Spinner,
  Alert,
  ListItem,
  Icon,
  List,
  LayerLoading,
  toast
} from "sancho";
import { useCollection } from "react-firebase-hooks/firestore";
import firebase from "firebase/app";
import { useCreateProject } from "./firebase";
import { Redirect } from "react-router";

export interface MeProps {}

export const Me: React.FunctionComponent<MeProps> = props => {
  const user = useSession();
  const [newProjectId, setNewProjectId] = React.useState();

  const { error, loading, value } = useCollection(
    firebase
      .firestore()
      .collection("projects")
      .where("uid", "==", user!.uid)
  );

  const { loading: creatingProject, create } = useCreateProject();

  function createProject() {
    create()
      .then(result => {
        setNewProjectId(result.id);
      })
      .catch(err => {
        toast({
          title: "An error occurred while creating your project",
          subtitle: err.message || "Please try again.",
          intent: "danger"
        });
      });
  }

  if (newProjectId) {
    return <Redirect to={newProjectId} />;
  }

  return (
    <LoginLayout title={user ? user.displayName || "Profile" : "Profile"}>
      <Layer
        elevation="sm"
        css={{
          marginTop: "4.5rem",
          overflow: "hidden",
          maxWidth: "550px",
          width: "100%"
        }}
      >
        <Navbar css={{ boxShadow: theme.shadows.xs }} position="static">
          <Toolbar>
            <Text gutter={false} variant="h5">
              Your projects
            </Text>
            <div css={{ flex: 1 }} />
            <Button
              onClick={createProject}
              css={{ position: "relative" }}
              intent="primary"
            >
              New project
              <LayerLoading loading={creatingProject} />
            </Button>
          </Toolbar>
        </Navbar>
        <div>
          {loading && (
            <div
              css={{
                margin: theme.spaces.md,
                display: "flex",
                justifyContent: "center"
              }}
            >
              <Spinner />
            </div>
          )}

          {error && (
            <Alert
              css={{ margin: theme.spaces.md }}
              title="An error occurred while loading your document. Please try reloading."
            />
          )}

          {value && value.size === 0 && (
            <Text
              muted
              css={{
                display: "block",
                margin: theme.spaces.md,
                fontSize: theme.sizes[0]
              }}
            >
              You have yet to create any projects.
            </Text>
          )}
          <List>
            {value &&
              value.docs.map(doc => {
                return (
                  <ListItem
                    key={doc.id}
                    primary={doc.get("title")}
                    iconAfter={<Icon icon="chevron-right" />}
                  />
                );
              })}
          </List>
        </div>
      </Layer>
    </LoginLayout>
  );
};
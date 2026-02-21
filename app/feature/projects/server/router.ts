import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../../members/utils";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, TEAMS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { createProjectSchema, updateProjectSchema,} from "../schemas";
import { Project } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskType } from "../../tasks/types";


const app = new Hono()
    .post(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("json", createProjectSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const storage = c.get("storage");
                const user = c.get("user");

                const {
                    name,
                    imageUrl,
                    identifier,
                    description,
                    icon,
                    default_assignee,
                    default_issue_status,
                    owners,
                    is_private,
                    auto_join,
                    members,
                    teamId
                } = c.req.valid("json");

                console.log("📸 Received imageUrl:", imageUrl);
                console.log("📸 ImageUrl instanceof File:", imageUrl instanceof File);

                const workspaceId = c.req.param("workspaceId");

                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 401);
                }

                let uploadedImageUrl: string | undefined;

                let projectIdentifier = identifier;
                if (!projectIdentifier) {
                    const existingProjects = await databases.listDocuments(
                        DATABASE_ID,
                        PROJECTS_ID,
                        [Query.equal("workspaceId", workspaceId)]
                    );
                    const projectCount = existingProjects.total + 1;
                    projectIdentifier = `MYRA-${projectCount}`;
                }

                const projectOwner = owners || user.$id;
                const project = await databases.createDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    ID.unique(),
                    {
                        name,
                        imageUrl: imageUrl,
                        workspaceId,
                        identifier: projectIdentifier,
                        description: description || "",
                        icon: icon || "folder",
                        default_assignee: default_assignee || "",
                        default_issue_status: default_issue_status || "Backlog",
                        owners: projectOwner,
                        is_private: is_private || false,
                        auto_join: auto_join || false,
                        members: members || [],
                        teamId: teamId || null
                    },
                );

                return c.json({ data: project });

            } catch (error) {
                console.error("❌ Backend error:", error);
                return c.json({ error: "Internal server error" }, 500);
            }
        }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.valid("query");

            if (!workspaceId) {
                return c.json({ error: "Missing workspaceId" }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 400);
            }

            // Fetch all projects from workspace
            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            );

            const accessibleProjects = await Promise.all(
                projects.documents.map(async (project) => {
                    // If project is not private, return it
                    if (!project.is_private) {
                        return project;
                    }

                    // If project is private, check user access
                    const hasAccess = await checkPrivateProjectAccess({
                        project,
                        currentUserId: user.$id,
                        databases
                    });

                    return hasAccess ? project : null;
                })
            );

            // Filter out null values (projects user doesn't have access to)
            const filteredProjects = accessibleProjects.filter(project => project !== null);

            console.log("FILTERED PROJECT DATA:", filteredProjects);

            return c.json({
                data: {
                    ...projects,
                    documents: filteredProjects,
                    total: filteredProjects.length
                }
            });
        }
    )

    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("json", updateProjectSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");

                const { projectId } = c.req.param();

                const {
                    name,
                    imageUrl,
                    identifier,
                    description,
                    icon,
                    default_assignee,
                    default_issue_status,
                    owners,
                    members,
                    teamId
                } = c.req.valid("json");

                console.log("📝 Received data:");
                console.log("  - imageUrl type:", typeof imageUrl);
                console.log("  - imageUrl length:", imageUrl?.length);

                const existingProject = await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId
                );

                const member = await getMember({
                    databases,
                    workspaceId: existingProject.workspaceId,
                    userId: user.$id,
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 401);
                }

                // ✅ SIMPLIFIED: Direct use of imageUrl (Base64 string)
                let processedImageUrl: string | null | undefined;

                if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
                    processedImageUrl = imageUrl; // Base64 string from frontend
                    console.log("🔗 Using Base64 string from frontend");
                } else if (imageUrl === "" || imageUrl === null) {
                    processedImageUrl = null;
                    console.log("🗑️ Removing image");
                } else {
                    processedImageUrl = existingProject.imageUrl;
                    console.log("🖼️ Keeping existing image");
                }

                const updateData: any = {};

                if (name !== undefined) updateData.name = name;
                if (processedImageUrl !== existingProject.imageUrl) {
                    updateData.imageUrl = processedImageUrl;
                }
                if (identifier !== undefined) updateData.identifier = identifier;
                if (description !== undefined) updateData.description = description;
                if (icon !== undefined) updateData.icon = icon;
                if (default_assignee !== undefined) updateData.default_assignee = default_assignee;
                if (default_issue_status !== undefined) updateData.default_issue_status = default_issue_status;
                if (owners !== undefined) updateData.owners = owners;
                if (members !== undefined) updateData.members = members;
                if (teamId !== undefined) updateData.teamId = teamId;

                console.log("📦 Update data:", Object.keys(updateData));

                const project = await databases.updateDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                    updateData
                );

                return c.json({
                    data: project,
                    message: "Project updated successfully"
                });

            } catch (error) {
                console.error("❌ Update error:", error);
                return c.json({
                    error: error instanceof Error ? error.message : "Internal server error"
                }, 500);
            }
        }
    )
    .delete("/:projectId", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { projectId } = c.req.param();

        const exsistingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        );

        const member = await getMember({
            databases,
            workspaceId: exsistingProject.workspaceId,
            userId: user.$id
        });

        if (!member) {
            return c.json({ error: "Unotorized" }, 401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        );
        return c.json({ data: { $id: exsistingProject.$id } });
    }
    )
    .get(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const { projectId } = c.req.param();
            const databases = c.get("databases");
            const user = c.get("user");

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            );


            const member = await getMember(
                {
                    databases,
                    workspaceId: project.workspaceId,
                    userId: user.$id
                }
            );

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            return c.json({ data: project });

        }

    )
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized " }, 401);
            }


            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));


            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]);


            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]);


            const assignedTaskCount = thisMonthAssignedTasks.total;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const incompleteTasksCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTasksCount - lastMonthIncompleteTasks.total;

            const thisMonthCompletedtask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthCompletedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const completedTaskCount = thisMonthCompletedtask.total;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTask.total;

            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskType.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskType.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const overDueTaskCount = thisMonthOverdueTasks.total;
            const overDueTaskDifference = overDueTaskCount - lastMonthOverdueTasks.total;


            return c.json(
                {
                    data: {
                        taskCount,
                        taskDifference,
                        assignedTaskCount,
                        assignedTaskDifference,
                        completedTaskCount,
                        completedTaskDifference,
                        incompleteTasksCount,
                        incompleteTaskDifference,
                        overDueTaskCount,
                        overDueTaskDifference,
                    }
                }
            )

        }
    )



export default app


async function checkPrivateProjectAccess({
    project,
    currentUserId,
    databases
}: {
    project: any;
    currentUserId: string;
    databases: any;
}) {
    try {
        if (project.owners) {
            try {
                const ownerDoc = await databases.getDocument(
                    DATABASE_ID,
                    MEMBERS_ID,
                    project.owners
                );

                console.log("🔍 Owner doc userId:", ownerDoc.userId);
                if (ownerDoc.userId === currentUserId) {
                    console.log("✅ Project owner access granted!");
                    return true;
                }
            } catch (error) {
                console.error("Error fetching owner doc:", error);
            }
        }


        if (project.default_assignee) {
            try {
                const assigneeDoc = await databases.getDocument(
                    DATABASE_ID,
                    MEMBERS_ID,
                    project.default_assignee
                );

                console.log("🔍 Assignee doc userId:", assigneeDoc.userId);
                if (assigneeDoc.userId === currentUserId) {
                    console.log("✅ Default assignee access granted!");
                    return true;
                }
            } catch (error) {
                console.error("Error fetching assignee doc:", error);
            }
        }


        if (project.members && project.members.length > 0) {

            for (const member of project.members) {
                console.log("🔍 Checking member:", member);
                console.log("🔍 Current user ID:", currentUserId);
                if (member.startsWith('user_')) {
                    const memberDocId = member.replace('user_', '');
                    console.log("🔍 Member Doc ID:", memberDocId);
                    try {
                        const memberDoc = await databases.getDocument(
                            DATABASE_ID,
                            MEMBERS_ID,
                            memberDocId
                        );

                        console.log("🔍 Member userId from doc:", memberDoc.userId);

                        if (memberDoc.userId === currentUserId) {
                            console.log("✅ Individual member access granted via userId!");
                            return true;
                        }
                    } catch (error) {
                        console.error("Error fetching member doc:", error);
                    }
                }

                if (member.startsWith('team_')) {
                    const teamId = member.replace('team_', '');

                    const isTeamMember = await checkUserInTeam({
                        databases,
                        teamId,
                        userId: currentUserId,
                        workspaceId: project.workspaceId
                    });

                    if (isTeamMember) {
                        console.log("✅ Team member access granted!");
                        return true;
                    }
                }
            }
        }
        if (project.teamId) {
            const isTeamMember = await checkUserInTeam({
                databases,
                teamId: project.teamId,
                userId: currentUserId,
                workspaceId: project.workspaceId
            });

            if (isTeamMember) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking private project access:", error);
        return false;
    }
}

async function checkUserInTeam({
    databases,
    teamId,
    userId,
    workspaceId
}: {
    databases: any;
    teamId: string;
    userId: string;
    workspaceId: string;
}) {
    try {
        const teams = await databases.listDocuments(
            DATABASE_ID,
            TEAMS_ID,
            [
                Query.equal("workspaceId", workspaceId),
            ]
        );
        const team = teams.documents.find((team: any) => team.$id === teamId);
        if (!team) {
            return false;
        }

        if (team.team_lead) {
            try {
                const teamLead = JSON.parse(team.team_lead);
                if (teamLead.id === userId) {
                    console.log("✅ User is team lead - access granted!");
                    return true;
                }
            } catch (error) {
                console.error("Error parsing team_lead JSON:", error);
            }
        }

        if (team.members) {
            try {
                const teamMembers = JSON.parse(team.members);
                const isMember = teamMembers.some((member: any) => member.id === userId);
                if (isMember) {
                    console.log("✅ User is team member - access granted!");
                    return true;
                }
            } catch (error) {
                console.error("Error parsing members JSON:", error);
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking user in team:", error);
        return false;
    }
}
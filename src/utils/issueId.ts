interface IssueIdProps {
  workspaceSlug: string;
  issueNumber: number;
  spaceSlug?: string;
}

export function generateIssueId({ workspaceSlug, issueNumber, spaceSlug }: IssueIdProps): string {
  // If issue has a space, use space slug (uppercase)
  if (spaceSlug) {
    return `${spaceSlug.toUpperCase()}-${issueNumber}`;
  }
  
  // If no space, use workspace slug
  return `${workspaceSlug}-${issueNumber}`;
}

export function getIssueIdFromIssue(issue: any): string {
  return generateIssueId({
    workspaceSlug: issue.workspace_slug,
    issueNumber: issue.issue_number,
    spaceSlug: issue.spaces?.[0]?.slug
  });
} 
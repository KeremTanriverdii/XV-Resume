export function formatCompanyAndRole(roleTitle?: string, jobLink?: string): string {
  const role = roleTitle?.trim() || 'Yazılım Uzmanı';
  if (!jobLink) return role;

  try {
    const url = new URL(jobLink.startsWith('http') ? jobLink : `https://${jobLink}`);
    const hostname = url.hostname.replace(/^www\./i, '');

    // Check if URL path has "at-[company]" or "/company-[name]" pattern (e.g. linkedin / kariyer jobs)
    const atMatch =
      url.pathname.match(/at-([a-z0-9-]+)/i) ||
      url.pathname.match(/company\/([a-z0-9-]+)/i);

    if (atMatch && atMatch[1]) {
      const companyFromPath = atMatch[1]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      if (role.toLowerCase().includes(companyFromPath.toLowerCase())) {
        return role;
      }
      return `${companyFromPath} - ${role}`;
    }

    // Extract company name from domain name
    const parts = hostname.split('.');
    let companyName = parts[0];
    if (parts.length > 2 && ['co', 'com', 'net', 'org', 'gov'].includes(parts[1])) {
      companyName = parts[0];
    } else if (parts.length >= 2) {
      companyName = parts[parts.length - 2];
    }

    companyName =
      companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase();

    // Avoid duplication if role already includes company name or a dash
    if (
      role.toLowerCase().startsWith(companyName.toLowerCase()) ||
      role.includes(' - ')
    ) {
      return role;
    }

    return `${companyName} - ${role}`;
  } catch {
    return role;
  }
}

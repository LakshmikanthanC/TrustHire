const fs = require("fs");
const path = "d:/pro/projects/TrustHire/fe/fe/app/dashboard/recruiter/jobs/page.tsx";

let content = fs.readFileSync(path, "utf8");

// Fix: add missing closing </div> after salary grid and after experience grid
content = content.replace(
  `              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Salary</Label>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Salary</Label>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Experience (yrs)</Label>
                  <Input
                    type="number"
                    value={form.experienceMin}
                    onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Experience (yrs)</Label>
                  <Input
                    type="number"
                    value={form.experienceMax}
                    onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
                  />
                </div>
              <div className="space-y-2">`,
  `              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Salary</Label>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Salary</Label>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Experience (yrs)</Label>
                  <Input
                    type="number"
                    value={form.experienceMin}
                    onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Experience (yrs)</Label>
                  <Input
                    type="number"
                    value={form.experienceMax}
                    onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
                  />
                </div>
              <div className="space-y-2">`
);

fs.writeFileSync(path, content);
console.log("Fixed. File length:", content.length);

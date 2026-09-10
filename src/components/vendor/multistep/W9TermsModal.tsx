import React, { useState } from 'react';
import { X, Search, FileText, ShieldAlert, AlertCircle, ExternalLink, BookOpen, Scale, ShieldCheck } from 'lucide-react';

interface W9TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const W9TermsModal: React.FC<W9TermsModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Form W-9 Terms and Conditions
                </h2>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  IRS Rev. 2026 Instructions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Department of the Treasury — Internal Revenue Service: Instructions for Requester of Form W-9 & Substitute Certifications.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Notice Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Official IRS references & substitute certification terms for electronic signing</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800"
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-700 text-xs leading-relaxed">
          {/* General Instructions */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              General Instructions
            </h3>
            <p>
              Section references are to the Internal Revenue Code unless otherwise noted.
            </p>
            <p>
              <strong>Future developments.</strong> For the latest information about developments related to Form W-9 and its instructions, such as legislation enacted after they were published, go to{' '}
              <a
                href="https://www.irs.gov/FormW9"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1 font-semibold"
              >
                www.irs.gov/FormW9 <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </section>

          {/* What's New */}
          <section className="space-y-3 pb-4 border-b border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-200/70">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              What’s New
            </h3>
            <p>
              <strong>Line 3a</strong> has been modified to clarify how a disregarded entity completes this line. An LLC that is a disregarded entity should check the appropriate box for the tax classification of its owner. Otherwise, it should check the “LLC” box and enter its appropriate tax classification.
            </p>
            <p>
              <strong>New line 3b</strong> has been added to this form. A flow-through entity is required to complete this line to indicate that it has direct or indirect foreign partners, owners, or beneficiaries when it provides the Form W-9 to another flow-through entity in which it has an ownership interest. This change is intended to provide a flow-through entity with information regarding the status of its indirect foreign partners, owners, or beneficiaries, so that it can satisfy any applicable reporting requirements. For example, a partnership that has any indirect foreign partners may be required to complete Schedules K-2 and K-3. See the Partnership Instructions for Schedules K-2 and K-3 (Form 1065).
            </p>
          </section>

          {/* Purpose of Form */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Purpose of Form
            </h3>
            <p>
              An individual or entity (Form W-9 requester) who is required to file an information return with the IRS is giving you this form because they must obtain your correct taxpayer identification number (TIN), which may be your social security number (SSN), individual taxpayer identification number (ITIN), adoption taxpayer identification number (ATIN), or employer identification number (EIN), to report on an information return the amount paid to you, or other amount reportable on an information return. Examples of information returns include, but are not limited to, the following:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-4 list-disc font-medium text-slate-800">
              <li>Form 1099-INT (interest earned or paid)</li>
              <li>Form 1099-DIV (dividends, including stocks or mutual funds)</li>
              <li>Form 1099-MISC (various types of income, prizes, awards, proceeds)</li>
              <li>Form 1099-NEC (nonemployee compensation)</li>
              <li>Form 1099-B (stock or mutual fund sales & broker transactions)</li>
              <li>Form 1099-S (proceeds from real estate transactions)</li>
              <li>Form 1099-K (merchant card & third-party network transactions)</li>
              <li>Form 1098 (home mortgage interest), 1098-E, 1098-T (tuition)</li>
              <li>Form 1099-C (canceled debt)</li>
              <li>Form 1099-A (acquisition or abandonment of secured property)</li>
            </ul>

            <p className="font-semibold text-slate-900">
              Use Form W-9 only if you are a U.S. person (including a resident alien), to provide your correct TIN.
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-medium">
              <strong>Caution:</strong> If you don’t return Form W-9 to the requester with a TIN, you might be subject to backup withholding. See <em>What is backup withholding</em>, later.
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 block font-bold">By signing the filled-out form, you:</strong>
              <ol className="list-decimal pl-5 space-y-1 text-slate-800">
                <li>Certify that the TIN you are giving is correct (or you are waiting for a number to be issued);</li>
                <li>Certify that you are not subject to backup withholding; or</li>
                <li>Claim exemption from backup withholding if you are a U.S. exempt payee; and</li>
                <li>Certify to your non-foreign status for purposes of withholding under chapter 3 or 4 of the Code (if applicable); and</li>
                <li>Certify that FATCA code(s) entered on this form (if any) indicating that you are exempt from the FATCA reporting is correct. See <em>What Is FATCA Reporting</em>, later, for further information.</li>
              </ol>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              <strong>Note:</strong> If you are a U.S. person and a requester gives you a form other than Form W-9 to request your TIN, you must use the requester’s form if it is substantially similar to this Form W-9.
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900">Definition of a U.S. person.</h4>
              <p>For federal tax purposes, you are considered a U.S. person if you are:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>An individual who is a U.S. citizen or U.S. resident alien;</li>
                <li>A partnership, corporation, company, or association created or organized in the United States or under the laws of the United States;</li>
                <li>An estate (other than a foreign estate); or</li>
                <li>A domestic trust (as defined in Regulations section 301.7701-7).</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900">Establishing U.S. status for purposes of chapter 3 and chapter 4 withholding.</h4>
              <p>
                Payments made to foreign persons, including certain distributions, allocations of income, or transfers of sales proceeds, may be subject to withholding under chapter 3 or chapter 4 of the Code (sections 1441–1474). Under those rules, if a Form W-9 or other certification of non-foreign status has not been received, a withholding agent, transferee, or partnership (payor) generally applies presumption rules that may require the payor to withhold applicable tax from the recipient, owner, transferor, or partner (payee). See Pub. 515, Withholding of Tax on Nonresident Aliens and Foreign Entities.
              </p>
              <p>The following persons must provide Form W-9 to the payor for purposes of establishing its non-foreign status:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>In the case of a disregarded entity with a U.S. owner, the U.S. owner of the disregarded entity and not the disregarded entity.</li>
                <li>In the case of a grantor trust with a U.S. grantor or other U.S. owner, generally, the U.S. grantor or other U.S. owner of the grantor trust and not the grantor trust.</li>
                <li>In the case of a U.S. trust (other than a grantor trust), the U.S. trust and not the beneficiaries of the trust.</li>
              </ul>
              <p>See Pub. 515 for more information on providing a Form W-9 or a certification of non-foreign status to avoid withholding.</p>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900">Foreign person.</h4>
              <p>
                If you are a foreign person or the U.S. branch of a foreign bank that has elected to be treated as a U.S. person (under Regulations section 1.1441-1(b)(2)(iv) or other applicable section for chapter 3 or 4 purposes), do not use Form W-9. Instead, use the appropriate Form W-8 or Form 8233 (see Pub. 515). If you are a qualified foreign pension fund under Regulations section 1.897(l)-1(d), or a partnership that is wholly owned by qualified foreign pension funds, that is treated as a non-foreign person for purposes of section 1445 withholding, do not use Form W-9. Instead, use Form W-8EXP (or other certification of non-foreign status).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900">Nonresident alien who becomes a resident alien.</h4>
              <p>
                Generally, only a nonresident alien individual may use the terms of a tax treaty to reduce or eliminate U.S. tax on certain types of income. However, most tax treaties contain a provision known as a saving clause. Exceptions specified in the saving clause may permit an exemption from tax to continue for certain types of income even after the payee has otherwise become a U.S. resident alien for tax purposes.
              </p>
              <p>
                If you are a U.S. resident alien who is relying on an exception contained in the saving clause of a tax treaty to claim an exemption from U.S. tax on certain types of income, you must attach a statement to Form W-9 that specifies the following five items:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>The treaty country. Generally, this must be the same treaty under which you claimed exemption from tax as a nonresident alien.</li>
                <li>The treaty article addressing the income.</li>
                <li>The article number (or location) in the tax treaty that contains the saving clause and its exceptions.</li>
                <li>The type and amount of income that qualifies for the exemption from tax.</li>
                <li>Sufficient facts to justify the exemption from tax under the terms of the treaty article.</li>
              </ol>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>Example:</strong> Article 20 of the U.S.-China income tax treaty allows an exemption from tax for scholarship income received by a Chinese student temporarily present in the United States. Under U.S. law, this student will become a resident alien for tax purposes if their stay in the United States exceeds 5 calendar years. However, paragraph 2 of the first Protocol to the U.S.-China treaty (dated April 30, 1984) allows the provisions of Article 20 to continue to apply even after the Chinese student becomes a resident alien of the United States. A Chinese student who qualifies for this exception (under paragraph 2 of the first Protocol) and is relying on this exception to claim an exemption from tax on their scholarship or fellowship income would attach to Form W-9 a statement that includes the information described above to support that exemption.
              </p>
              <p>If you are a nonresident alien or a foreign entity, give the requester the appropriate completed Form W-8 or Form 8233.</p>
            </div>
          </section>

          {/* Backup Withholding */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Backup Withholding
            </h3>
            <p>
              <strong>What is backup withholding?</strong> Persons making certain payments to you must under certain conditions withhold and pay to the IRS 24% of such payments. This is called “backup withholding.” Payments that may be subject to backup withholding include, but are not limited to, interest, tax-exempt interest, dividends, broker and barter exchange transactions, rents, royalties, nonemployee pay, payments made in settlement of payment card and third-party network transactions, and certain payments from fishing boat operators. Real estate transactions are not subject to backup withholding.
            </p>
            <p>
              You will not be subject to backup withholding on payments you receive if you give the requester your correct TIN, make the proper certifications, and report all your taxable interest and dividends on your tax return.
            </p>
            <p className="font-bold text-slate-900">Payments you receive will be subject to backup withholding if:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>You do not furnish your TIN to the requester;</li>
              <li>You do not certify your TIN when required (see the instructions for Part II for details);</li>
              <li>The IRS tells the requester that you furnished an incorrect TIN;</li>
              <li>The IRS tells you that you are subject to backup withholding because you did not report all your interest and dividends on your tax return (for reportable interest and dividends only); or</li>
              <li>You do not certify to the requester that you are not subject to backup withholding, as described in item 4 under “By signing the filled-out form” above (for reportable interest and dividend accounts opened after 1983 only).</li>
            </ol>
            <p>
              Certain payees and payments are exempt from backup withholding. See <em>Exempt payee code</em>, later, and the separate Instructions for the Requester of Form W-9 for more information.
            </p>
            <p>
              See also <em>Establishing U.S. status for purposes of chapter 3 and chapter 4 withholding</em>, earlier.
            </p>
          </section>

          {/* What Is FATCA Reporting? */}
          <section className="space-y-2 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              What Is FATCA Reporting?
            </h3>
            <p>
              The Foreign Account Tax Compliance Act (FATCA) requires a participating foreign financial institution to report all U.S. account holders that are specified U.S. persons. Certain payees are exempt from FATCA reporting. See <em>Exemption from FATCA reporting code</em>, later, and the Instructions for the Requester of Form W-9 for more information.
            </p>
          </section>

          {/* Updating Your Information */}
          <section className="space-y-2 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Updating Your Information
            </h3>
            <p>
              You must provide updated information to any person to whom you claimed to be an exempt payee if you are no longer an exempt payee and anticipate receiving reportable payments in the future from this person. For example, you may need to provide updated information if you are a C corporation that elects to be an S corporation, or if you are no longer tax exempt. In addition, you must furnish a new Form W-9 if the name or TIN changes for the account, for example, if the grantor of a grantor trust dies.
            </p>
          </section>

          {/* Penalties */}
          <section className="space-y-3 pb-4 border-b border-slate-100 bg-rose-50/40 p-4 rounded-xl border border-rose-200">
            <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Penalties
            </h3>
            <ul className="space-y-2 pl-2">
              <li>
                <strong>Failure to furnish TIN:</strong> If you fail to furnish your correct TIN to a requester, you are subject to a penalty of $50 for each such failure unless your failure is due to reasonable cause and not to willful neglect.
              </li>
              <li>
                <strong>Civil penalty for false information with respect to withholding:</strong> If you make a false statement with no reasonable basis that results in no backup withholding, you are subject to a $500 penalty.
              </li>
              <li>
                <strong>Criminal penalty for falsifying information:</strong> Willfully falsifying certifications or affirmations may subject you to criminal penalties including fines and/or imprisonment.
              </li>
              <li>
                <strong>Misuse of TINs:</strong> If the requester discloses or uses TINs in violation of federal law, the requester may be subject to civil and criminal penalties.
              </li>
            </ul>
          </section>

          {/* Specific Instructions */}
          <section className="space-y-4 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Specific Instructions
            </h3>

            {/* Line 1 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Line 1</h4>
              <p>
                You must enter one of the following on this line; do not leave this line blank. The name should match the name on your tax return.
              </p>
              <p>
                If this Form W-9 is for a joint account (other than an account maintained by a foreign financial institution (FFI)), list first, and then circle, the name of the person or entity whose number you entered in Part I of Form W-9. If you are providing Form W-9 to an FFI to document a joint account, each holder of the account that is a U.S. person must provide a Form W-9.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Individual:</strong> Generally, enter the name shown on your tax return. If you have changed your last name without informing the Social Security Administration (SSA) of the name change, enter your first name, the last name as shown on your social security card, and your new last name.
                  <br />
                  <em>Note for ITIN applicant:</em> Enter your individual name as it was entered on your Form W-7 application, line 1a. This should also be the same as the name you entered on the Form 1040 you filed with your application.
                </li>
                <li>
                  <strong>Sole proprietor:</strong> Enter your individual name as shown on your Form 1040 on line 1. Enter your business, trade, or “doing business as” (DBA) name on line 2.
                </li>
                <li>
                  <strong>Partnership, C corporation, S corporation, or LLC, other than a disregarded entity:</strong> Enter the entity’s name as shown on the entity’s tax return on line 1 and any business, trade, or DBA name on line 2.
                </li>
                <li>
                  <strong>Other entities:</strong> Enter your name as shown on required U.S. federal tax documents on line 1. This name should match the name shown on the charter or other legal document creating the entity. Enter any business, trade, or DBA name on line 2.
                </li>
                <li>
                  <strong>Disregarded entity:</strong> In general, a business entity that has a single owner, including an LLC, and is not a corporation, is disregarded as an entity separate from its owner (a disregarded entity). See Regulations section 301.7701-2(c)(2). A disregarded entity should check the appropriate box for the tax classification of its owner. Enter the owner’s name on line 1. The name of the owner entered on line 1 should never be a disregarded entity. The name on line 1 should be the name shown on the income tax return on which the income should be reported. For example, if a foreign LLC that is treated as a disregarded entity for U.S. federal tax purposes has a single owner that is a U.S. person, the U.S. owner’s name is required to be provided on line 1. If the direct owner of the entity is also a disregarded entity, enter the first owner that is not disregarded for federal tax purposes. Enter the disregarded entity’s name on line 2. If the owner of the disregarded entity is a foreign person, the owner must complete an appropriate Form W-8 instead of a Form W-9. This is the case even if the foreign person has a U.S. TIN.
                </li>
              </ul>
            </div>

            {/* Line 2 */}
            <div className="space-y-1 pt-1">
              <h4 className="font-bold text-slate-900">Line 2</h4>
              <p>
                If you have a business name, trade name, DBA name, or disregarded entity name, enter it on line 2.
              </p>
            </div>

            {/* Line 3a */}
            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-slate-900">Line 3a</h4>
              <p>
                Check the appropriate box on line 3a for the U.S. federal tax classification of the person whose name is entered on line 1. Check only one box on line 3a.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th className="p-2 border border-slate-200 font-bold">IF the entity/individual on line 1 is a(n) . . .</th>
                      <th className="p-2 border border-slate-200 font-bold">THEN check the box for . . .</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Corporation</td>
                      <td className="p-2 border border-slate-200">Corporation.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Individual or<br />• Sole proprietorship</td>
                      <td className="p-2 border border-slate-200">Individual/sole proprietor.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">
                        • LLC classified as a partnership for U.S. federal tax purposes or<br />
                        • LLC that has filed Form 8832 or 2553 electing to be taxed as a corporation
                      </td>
                      <td className="p-2 border border-slate-200">
                        Limited liability company and enter the appropriate tax classification:<br />
                        P = Partnership, C = C corporation, or S = S corporation.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Partnership</td>
                      <td className="p-2 border border-slate-200">Partnership.</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200">• Trust/estate</td>
                      <td className="p-2 border border-slate-200">Trust/estate.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Line 3b */}
            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-slate-900">Line 3b</h4>
              <p>
                Check this box if you are a partnership (including an LLC classified as a partnership for U.S. federal tax purposes), trust, or estate that has any foreign partners, owners, or beneficiaries, and you are providing this form to a partnership, trust, or estate, in which you have an ownership interest. You must check the box on line 3b if you receive a Form W-8 (or documentary evidence) from any partner, owner, or beneficiary establishing foreign status or if you receive a Form W-9 from any partner, owner, or beneficiary that has checked the box on line 3b.
              </p>
              <p className="text-[11px] text-slate-500">
                <em>Note:</em> A partnership that provides a Form W-9 and checks box 3b may be required to complete Schedules K-2 and K-3 (Form 1065). For more information, see the Partnership Instructions for Schedules K-2 and K-3 (Form 1065).
              </p>
              <p>
                If you are required to complete line 3b but fail to do so, you may not receive the information necessary to file a correct information return with the IRS or furnish a correct payee statement to your partners or beneficiaries. See, for example, sections 6698, 6722, and 6724 for penalties that may apply.
              </p>
            </div>

            {/* Line 4 Exemptions */}
            <div className="space-y-3 pt-1">
              <h4 className="font-bold text-slate-900">Line 4 Exemptions</h4>
              <p>
                If you are exempt from backup withholding and/or FATCA reporting, enter in the appropriate space on line 4 any code(s) that may apply to you.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-bold">Exempt payee code:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Generally, individuals (including sole proprietors) are not exempt from backup withholding.</li>
                  <li>Except as provided below, corporations are exempt from backup withholding for certain payments, including interest and dividends.</li>
                  <li>Corporations are not exempt from backup withholding for payments made in settlement of payment card or third-party network transactions.</li>
                  <li>Corporations are not exempt from backup withholding with respect to attorneys’ fees or gross proceeds paid to attorneys, and corporations that provide medical or health care services are not exempt with respect to payments reportable on Form 1099-MISC.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  The following codes identify payees that are exempt from backup withholding. Enter the appropriate code in the space on line 4:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-2 text-[11px]">
                  <div><strong>1</strong>—An organization exempt from tax under section 501(a), any IRA, or a custodial account under section 403(b)(7).</div>
                  <div><strong>2</strong>—The United States or any of its agencies or instrumentalities.</div>
                  <div><strong>3</strong>—A state, DC, a U.S. commonwealth or territory, or political subdivision.</div>
                  <div><strong>4</strong>—A foreign government or political subdivision/agency.</div>
                  <div><strong>5</strong>—A corporation.</div>
                  <div><strong>6</strong>—A dealer in securities/commodities required to register in the US.</div>
                  <div><strong>7</strong>—A futures commission merchant registered with CFTC.</div>
                  <div><strong>8</strong>—A real estate investment trust (REIT).</div>
                  <div><strong>9</strong>—An entity registered under the Investment Company Act of 1940.</div>
                  <div><strong>10</strong>—A common trust fund operated by a bank under section 584(a).</div>
                  <div><strong>11</strong>—A financial institution as defined under section 581.</div>
                  <div><strong>12</strong>—A middleman known in the investment community as a nominee/custodian.</div>
                  <div><strong>13</strong>—A trust exempt from tax under section 664 or described in section 4947.</div>
                </div>
              </div>

              {/* Payment exemption chart */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th className="p-2 border border-slate-200 font-bold">IF the payment is for . . .</th>
                      <th className="p-2 border border-slate-200 font-bold">THEN the payment is exempt for . . .</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Interest and dividend payments</td>
                      <td className="p-2 border border-slate-200">All exempt payees except for 7.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Broker transactions</td>
                      <td className="p-2 border border-slate-200">
                        Exempt payees 1 through 4 and 6 through 11 and all C corporations. S corporations must not enter an exempt payee code because they are exempt only for sales of noncovered securities acquired prior to 2012.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Barter exchange transactions and patronage dividends</td>
                      <td className="p-2 border border-slate-200">Exempt payees 1 through 4.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border border-slate-200">• Payments over $600 required to be reported and direct sales over $5,000¹</td>
                      <td className="p-2 border border-slate-200">Generally, exempt payees 1 through 5.²</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200">• Payments made in settlement of payment card or third-party network transactions</td>
                      <td className="p-2 border border-slate-200">Exempt payees 1 through 4.</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[10px] text-slate-400 mt-1">
                  ¹ See Form 1099-MISC, Miscellaneous Information, and its instructions.<br />
                  ² However, payments made to a corporation reportable on Form 1099-MISC are not exempt for medical/health care, attorneys’ fees, or federal executive agencies.
                </p>
              </div>

              {/* Exemption from FATCA reporting code */}
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-900">Exemption from FATCA reporting code.</h5>
                <p>
                  The following codes identify payees that are exempt from reporting under FATCA. These codes apply to persons submitting this form for accounts maintained outside of the United States by certain foreign financial institutions. Therefore, if you are only submitting this form for an account you hold in the United States, you may leave this field blank.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-2 text-[11px]">
                  <div><strong>A</strong>—An organization exempt from tax under section 501(a) or IRA.</div>
                  <div><strong>B</strong>—The United States or any of its agencies or instrumentalities.</div>
                  <div><strong>C</strong>—A state, the District of Columbia, or U.S. commonwealth/territory.</div>
                  <div><strong>D</strong>—A corporation regularly traded on established securities markets.</div>
                  <div><strong>E</strong>—A member of the same expanded affiliated group as a D corporation.</div>
                  <div><strong>F</strong>—A dealer in securities, commodities, or derivatives registered in the US.</div>
                  <div><strong>G</strong>—A real estate investment trust (REIT).</div>
                  <div><strong>H</strong>—A regulated investment company (RIC) or entity under 1940 Act.</div>
                  <div><strong>I</strong>—A common trust fund as defined in section 584(a).</div>
                  <div><strong>J</strong>—A bank as defined in section 581.</div>
                  <div><strong>K</strong>—A broker.</div>
                  <div><strong>L</strong>—A trust exempt from tax under section 664 or described in section 4947(a)(1).</div>
                  <div><strong>M</strong>—A tax-exempt trust under a section 403(b) plan or section 457(g) plan.</div>
                </div>
              </div>
            </div>

            {/* Line 5 & 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900">Line 5 (Address)</h4>
                <p>
                  Enter your address (number, street, and apartment or suite number). This is where the requester of this Form W-9 will mail your information returns.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900">Line 6 (City, State, ZIP)</h4>
                <p>
                  Enter your city, state, and ZIP code.
                </p>
              </div>
            </div>
          </section>

          {/* Part I. Taxpayer Identification Number (TIN) */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Part I. Taxpayer Identification Number (TIN)
            </h3>
            <p>
              Enter your TIN in the appropriate box. If you are a resident alien and you do not have, and are not eligible to get, an SSN, your TIN is your IRS ITIN. Enter it in the entry space for the Social security number. If you do not have an ITIN, see <em>How to get a TIN</em> below.
            </p>
            <p>
              If you are a sole proprietor and you have an EIN, you may enter either your SSN or EIN.
            </p>
            <p>
              If you are a single-member LLC that is disregarded as an entity separate from its owner, enter the owner’s SSN (or EIN, if the owner has one). If the LLC is classified as a corporation or partnership, enter the entity’s EIN.
            </p>
            <p className="text-[11px] text-slate-500">
              <em>Note:</em> See <em>What Name and Number To Give the Requester</em>, later, for further clarification of name and TIN combinations.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 block font-bold">How to get a TIN:</strong>
              <p>
                If you do not have a TIN, apply for one immediately. To apply for an SSN, get Form SS-5, Application for a Social Security Card, from your local SSA office or online at <a href="https://www.SSA.gov" target="_blank" rel="noreferrer" className="text-blue-600 underline">www.SSA.gov</a>. You may also get this form by calling 800-772-1213. Use Form W-7 to apply for an ITIN, or Form SS-4 to apply for an EIN online at <a href="https://www.irs.gov/EIN" target="_blank" rel="noreferrer" className="text-blue-600 underline">www.irs.gov/EIN</a>.
              </p>
              <p>
                If you are asked to complete Form W-9 but do not have a TIN, apply for a TIN and enter “Applied For” in the space for the TIN, sign and date the form, and give it to the requester. For interest and dividend payments, you will generally have 60 days to get a TIN and give it to the requester before backup withholding applies.
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
              <strong>Caution:</strong> A disregarded U.S. entity that has a foreign owner must use the appropriate Form W-8.
            </div>
          </section>

          {/* Part II. Certification */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Part II. Certification
            </h3>
            <p>
              To establish to the withholding agent that you are a U.S. person, or resident alien, sign Form W-9. You may be requested to sign by the withholding agent even if item 1, 4, or 5 below indicates otherwise.
            </p>
            <p>
              For a joint account, only the person whose TIN is shown in Part I should sign (when required). In the case of a disregarded entity, the person identified on line 1 must sign.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 block font-bold">Signature requirements: Complete the certification as indicated in items 1 through 5 below:</strong>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Interest, dividend, and barter exchange accounts opened before 1984 and broker accounts considered active during 1983:</strong> You must give your correct TIN, but you do not have to sign the certification.</li>
                <li><strong>Interest, dividend, broker, and barter exchange accounts opened after 1983 and broker accounts considered inactive during 1983:</strong> You must sign the certification or backup withholding will apply. If you are subject to backup withholding and you are merely providing your correct TIN to the requester, you must cross out item 2 in the certification before signing the form.</li>
                <li><strong>Real estate transactions:</strong> You must sign the certification. You may cross out item 2 of the certification.</li>
                <li><strong>Other payments:</strong> You must give your correct TIN, but you do not have to sign the certification unless you have been notified that you have previously given an incorrect TIN.</li>
                <li><strong>Mortgage interest paid by you, acquisition or abandonment of secured property, cancellation of debt, 529/ABLE/IRA/HSA distributions:</strong> You must give your correct TIN, but you do not have to sign the certification.</li>
              </ol>
            </div>
          </section>

          {/* What Name and Number To Give the Requester Table */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              What Name and Number To Give the Requester
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="p-2 border border-slate-200 font-bold">For this type of account:</th>
                    <th className="p-2 border border-slate-200 font-bold">Give name and SSN of:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">1. Individual</td>
                    <td className="p-2 border border-slate-200">The individual</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">2. Two or more individuals (joint account) other than FFI</td>
                    <td className="p-2 border border-slate-200">The actual owner of the account or the first individual on the account¹</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">3. Two or more U.S. persons (joint account with FFI)</td>
                    <td className="p-2 border border-slate-200">Each holder of the account</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">4. Custodial account of a minor (Uniform Gift to Minors Act)</td>
                    <td className="p-2 border border-slate-200">The minor²</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">5. a. The usual revocable savings trust (grantor is trustee)<br />b. Trust account not a legal/valid trust under state law</td>
                    <td className="p-2 border border-slate-200">The grantor-trustee¹<br />The actual owner¹</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">6. Sole proprietorship or disregarded entity owned by an individual</td>
                    <td className="p-2 border border-slate-200">The owner³</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">7. Grantor trust filing under Optional Filing Method 1</td>
                    <td className="p-2 border border-slate-200">The grantor*</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="p-2 border border-slate-200 font-bold">For this type of account:</th>
                    <th className="p-2 border border-slate-200 font-bold">Give name and EIN of:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">8. Disregarded entity not owned by an individual</td>
                    <td className="p-2 border border-slate-200">The owner</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">9. A valid trust, estate, or pension trust</td>
                    <td className="p-2 border border-slate-200">Legal entity⁴</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">10. Corporation or LLC electing corporate status on Form 8832/2553</td>
                    <td className="p-2 border border-slate-200">The corporation</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">11. Association, club, religious, charitable, educational org</td>
                    <td className="p-2 border border-slate-200">The organization</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">12. Partnership or multi-member LLC</td>
                    <td className="p-2 border border-slate-200">The partnership</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">13. A broker or registered nominee</td>
                    <td className="p-2 border border-slate-200">The broker or nominee</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200">14. Account with Dept of Agriculture in the name of a public entity</td>
                    <td className="p-2 border border-slate-200">The public entity</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200">15. Grantor trust filing Form 1041 or under Optional Filing Method 2</td>
                    <td className="p-2 border border-slate-200">The trust</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                ¹ List first and circle the name of the person whose number you furnish.<br />
                ² Circle the minor’s name and furnish the minor’s SSN.<br />
                ³ Show your individual name on line 1, and DBA on line 2. You may use SSN or EIN.<br />
                ⁴ List first and circle the name of the trust, estate, or pension trust.<br />
                * Note: The grantor must also provide a Form W-9 to the trustee of the trust.
              </p>
            </div>
          </section>

          {/* Secure Your Tax Records From Identity Theft */}
          <section className="space-y-3 pb-4 border-b border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure Your Tax Records From Identity Theft
            </h3>
            <p>
              Identity theft occurs when someone uses your personal information, such as your name, SSN, or other identifying information, without your permission to commit fraud or other crimes. An identity thief may use your SSN to get a job or may file a tax return using your SSN to receive a refund.
            </p>
            <div className="space-y-1">
              <strong className="text-slate-900 block font-bold">To reduce your risk:</strong>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Protect your SSN,</li>
                <li>Ensure your employer is protecting your SSN, and</li>
                <li>Be careful when choosing a tax return preparer.</li>
              </ul>
            </div>
            <p>
              If your tax records are affected by identity theft and you receive a notice from the IRS, respond right away to the name and phone number printed on the IRS notice or letter. Contact the IRS Identity Theft Hotline at <strong>800-908-4490</strong> or submit Form 14039. For more information, see Pub. 5027, Identity Theft Information for Taxpayers.
            </p>
            <p>
              <strong>Protect yourself from suspicious emails or phishing schemes:</strong> The IRS does not initiate contacts with taxpayers via emails. Also, the IRS does not request personal detailed information through email or ask taxpayers for PIN numbers, passwords, or similar secret access information for credit cards, banks, or other financial accounts.
            </p>
            <p className="text-[11px] text-slate-600">
              If you receive an unsolicited email claiming to be from the IRS, forward this message to <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">phishing@irs.gov</code>. You may also report misuse of the IRS name/logo to TIGTA at 800-366-4484 or to the FTC at <a href="https://www.ftc.gov/complaint" target="_blank" rel="noreferrer" className="text-blue-600 underline">www.ftc.gov/complaint</a>.
            </p>
          </section>

          {/* Privacy Act Notice */}
          <section className="space-y-2 pb-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Privacy Act Notice
            </h3>
            <p>
              Section 6109 of the Internal Revenue Code requires you to provide your correct TIN to persons (including federal agencies) who are required to file information returns with the IRS to report interest, dividends, or certain other income paid to you; mortgage interest you paid; the acquisition or abandonment of secured property; the cancellation of debt; or contributions you made to an IRA, Archer MSA, or HSA. The person collecting this form uses the information on the form to file information returns with the IRS, reporting the above information.
            </p>
            <p>
              Routine uses of this information include giving it to the Department of Justice for civil and criminal litigation and to cities, states, the District of Columbia, and U.S. commonwealths and territories for use in administering their laws. The information may also be disclosed to other countries under a treaty, to federal and agency to enforce civil and criminal laws, or to federal law enforcement and intelligence agencies to combat terrorism. You must provide your TIN whether or not you are required to file a tax return. Under section 3406, payors must generally withhold a percentage of taxable interest, dividends, and certain other payments to a payee who does not give a TIN to the payor. Certain penalties may also apply for providing false or fraudulent information.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            UrSpot Compliance & Merchant Certification Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Terms & Instructions
          </button>
        </div>
      </div>
    </div>
  );
};
